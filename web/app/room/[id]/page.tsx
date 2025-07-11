"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageCircle, ArrowLeft, Send } from "lucide-react";
import { UserData, IncomingMessage, ChatMessage } from "@/types";

export default function Room() {
  const params = useParams();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [roomId] = useState(params.id as string);
  const [users, setUsers] = useState<UserData[]>([]);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [nearbyUsers, setNearbyUsers] = useState<UserData[]>([]);

  const GRID_SIZE = 40;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const MOVE_SPEED = 5;
  const INTERACTION_DISTANCE = 80;

  // Helper function to generate user avatar/icon
  const getUserAvatar = (username: string) => {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  };

  // Helper function to generate consistent colors for users
  const getUserColor = (userId: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index =
      userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: { roomId },
        })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      handleMovement();
      updateNearbyUsers();
      drawGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []); // Fixed: Add empty dependency array to prevent infinite loop

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => new Set([...prev, e.key.toLowerCase()]));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleWebSocketMessage = useCallback(
    (message: IncomingMessage) => {
      console.log("Received message:", message); // Debug log
      switch (message.type) {
        case "ROOM_STATE":
          const roomUsers = message.payload.users || [];
          const currentUserId = message.payload.currentUserId;
          console.log(
            "Room users:",
            roomUsers,
            "Current user ID:",
            currentUserId
          ); // Debug log
          setUsers(roomUsers);
          setCurrentUserId(currentUserId || null);
          // Set current user based on the currentUserId from server
          if (currentUserId) {
            const currentUserData = roomUsers.find(
              (u) => u.id === currentUserId
            );
            if (currentUserData) {
              console.log("Setting current user:", currentUserData); // Debug log
              setCurrentUser(currentUserData);
            }
          }
          break;
        case "USER_JOINED":
          if (message.payload.user) {
            setUsers((prev) => [...prev, message.payload.user!]);
            // Add system message for user joining
            setChatMessages((prev) => [
              ...prev,
              {
                id: `system-${Date.now()}`,
                userId: "system",
                username: "System",
                message: `${message.payload.user!.username} joined the room`,
                timestamp: Date.now(),
              },
            ]);
          }
          break;
        case "USER_LEFT":
          if (message.payload.userId) {
            const leftUser = users.find((u) => u.id === message.payload.userId);
            setUsers((prev) =>
              prev.filter((user) => user.id !== message.payload.userId)
            );
            // Add system message for user leaving
            if (leftUser) {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: `system-${Date.now()}`,
                  userId: "system",
                  username: "System",
                  message: `${leftUser.username} left the room`,
                  timestamp: Date.now(),
                },
              ]);
            }
          }
          break;
        case "MOVEMENT":
          if (message.payload.userId && message.payload.position) {
            setUsers((prev) =>
              prev.map((user) =>
                user.id === message.payload.userId
                  ? { ...user, position: message.payload.position! }
                  : user
              )
            );
            // Update current user position if it's their movement
            if (currentUserId && currentUserId === message.payload.userId) {
              setCurrentUser((prev) =>
                prev ? { ...prev, position: message.payload.position! } : null
              );
            }
          }
          break;
        case "CHAT":
          if (
            message.payload.userId &&
            message.payload.username &&
            message.payload.chat
          ) {
            setChatMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                userId: message.payload.userId!,
                username: message.payload.username!,
                message: message.payload.chat!,
                timestamp: Date.now(),
              },
            ]);
          }
          break;
        case "ERROR":
          console.error("WebSocket error:", message.payload.error);
          // Add error message to chat
          setChatMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              userId: "system",
              username: "System",
              message: `Error: ${message.payload.error}`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "MOVEMENT_REJECTED":
          console.warn("Movement rejected:", message.payload.error);
          // Add warning message to chat
          setChatMessages((prev) => [
            ...prev,
            {
              id: `warning-${Date.now()}`,
              userId: "system",
              username: "System",
              message: `Movement blocked: ${message.payload.error}`,
              timestamp: Date.now(),
            },
          ]);
          break;
      }
    },
    [users]
  ); // Close useCallback with dependency array

  const handleMovement = useCallback(() => {
    if (!currentUser || !wsRef.current) return;

    let newX = currentUser.position.x;
    let newY = currentUser.position.y;

    if (keys.has("w") || keys.has("arrowup")) newY -= MOVE_SPEED;
    if (keys.has("s") || keys.has("arrowdown")) newY += MOVE_SPEED;
    if (keys.has("a") || keys.has("arrowleft")) newX -= MOVE_SPEED;
    if (keys.has("d") || keys.has("arrowright")) newX += MOVE_SPEED;

    newX = Math.max(20, Math.min(CANVAS_WIDTH - 20, newX));
    newY = Math.max(20, Math.min(CANVAS_HEIGHT - 20, newY));

    if (newX !== currentUser.position.x || newY !== currentUser.position.y) {
      const newPosition = { x: newX, y: newY };
      setCurrentUser((prev) =>
        prev ? { ...prev, position: newPosition } : null
      );

      wsRef.current.send(
        JSON.stringify({
          type: "MOVEMENT",
          payload: { position: newPosition },
        })
      );
    }
  }, [currentUser, keys]);

  const updateNearbyUsers = useCallback(() => {
    if (!currentUser) return;

    const nearby = users.filter((user) => {
      if (user.id === currentUserId) return false;

      const distance = Math.sqrt(
        Math.pow(user.position.x - currentUser.position.x, 2) +
          Math.pow(user.position.y - currentUser.position.y, 2)
      );

      return distance <= INTERACTION_DISTANCE;
    });

    setNearbyUsers(nearby);
  }, [currentUser, users, currentUserId]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background with theme colors
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid with theme colors
    ctx.strokeStyle = "#e4e4e7";
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // console.log("Drawing users:", users.length, "users:", users); // Debug log
    // console.log("Current user ID:", currentUserId); // Debug log

    // Draw all users from the users array
    users.forEach((user) => {
      const isCurrentUser = user.id === currentUserId;
      // console.log(
      //   "Drawing user:",
      //   user.username,
      //   "isCurrentUser:",
      //   isCurrentUser,
      //   "position:",
      //   user.position
      // ); // Debug log
      drawUser(ctx, user, isCurrentUser);
    });

    // Debug: Draw a test circle to ensure canvas is working
    ctx.beginPath();
    ctx.arc(50, 50, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
  }, [users, currentUserId, nearbyUsers]);

  const drawUser = (
    ctx: CanvasRenderingContext2D,
    user: UserData,
    isCurrentUser: boolean
  ) => {
    const x = user.position.x;
    const y = user.position.y;

    // console.log(
    //   `Drawing user ${user.username} (ID: ${user.id}) at position (${x}, ${y}), isCurrentUser: ${isCurrentUser}`
    // ); // Debug log

    // Draw user circle
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);

    if (isCurrentUser) {
      // Use a solid color for current user instead of CSS variable
      ctx.fillStyle = "#2563eb"; // blue-600
      ctx.strokeStyle = "#2563eb";
    } else {
      // Use consistent color based on user ID
      const colorMap = {
        "bg-red-500": "#ef4444",
        "bg-blue-500": "#3b82f6",
        "bg-green-500": "#22c55e",
        "bg-purple-500": "#a855f7",
        "bg-orange-500": "#f97316",
        "bg-pink-500": "#ec4899",
        "bg-indigo-500": "#6366f1",
        "bg-teal-500": "#14b8a6",
      };
      const userColorClass = getUserColor(user.id);
      const userColor =
        colorMap[userColorClass as keyof typeof colorMap] || "#6b7280";
      ctx.fillStyle = userColor;
      ctx.strokeStyle = userColor;
    }

    ctx.fill();
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw user avatar/initial inside circle
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(getUserAvatar(user.username), x, y);

    // Draw username below
    ctx.fillStyle = "#374151"; // gray-700
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(user.username, x, y + 25);

    // Draw "You" indicator for current user
    if (isCurrentUser) {
      ctx.fillStyle = "#2563eb"; // blue-600
      ctx.font = "bold 10px Arial";
      ctx.fillText("(You)", x, y + 40);
    }

    // Draw interaction circle if nearby
    if (isCurrentUser && nearbyUsers.length > 0) {
      ctx.beginPath();
      ctx.arc(x, y, INTERACTION_DISTANCE, 0, 2 * Math.PI);
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const sendChatMessage = () => {
    if (chatInput.trim() && wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "CHAT",
          payload: { message: chatInput.trim() },
        })
      );
      setChatInput("");
    }
  };

  const leaveRoom = () => {
    if (wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "LEAVE_ROOM",
          payload: {},
        })
      );
    }
    router.push("/");
  };
  return (
    <div className="h-screen bg-gradient-to-br from-background to-secondary/10 flex flex-col">
      {" "}
      {/* Header */}{" "}
      <div className="bg-card shadow-sm border-b border-border p-4 flex justify-between items-center">
        {" "}
        <div className="flex items-center space-x-4">
          {" "}
          <Button variant="ghost" size="sm" onClick={leaveRoom}>
            {" "}
            <ArrowLeft className="w-4 h-4 mr-2" /> Leave Room{" "}
          </Button>{" "}
          <div className="flex items-center space-x-2">
            {" "}
            <Badge variant="secondary">Room: {roomId}</Badge>{" "}
            <Badge variant={isConnected ? "default" : "destructive"}>
              {" "}
              {isConnected ? "Connected" : "Disconnected"}{" "}
            </Badge>{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex items-center space-x-2">
          {" "}
          <Badge variant="outline">
            {" "}
            <Users className="w-4 h-4 mr-1" /> {users.length}{" "}
          </Badge>{" "}
          {/* User List */}
          {users.length > 0 && (
            <div className="flex items-center space-x-1">
              {users.slice(0, 3).map((user) => (
                <Avatar key={user.id} className="w-6 h-6">
                  <AvatarFallback
                    className={`text-xs text-white ${getUserColor(user.id)}`}
                  >
                    {getUserAvatar(user.username)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {users.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{users.length - 3}
                </span>
              )}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="relative"
          >
            {" "}
            <MessageCircle className="w-4 h-4 mr-2" /> Chat
            {chatMessages.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center"
              >
                {chatMessages.length}
              </Badge>
            )}
          </Button>{" "}
        </div>{" "}
      </div>{" "}
      {/* Main Content */}{" "}
      <div className="flex-1 flex">
        {" "}
        {/* Game Area */}{" "}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {" "}
          <div className="relative bg-card rounded-lg shadow-lg border border-border">
            {" "}
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-0 rounded-lg focus:outline-none"
              tabIndex={0}
            />{" "}
            {/* Controls */}{" "}
            <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
              {" "}
              <div className="text-sm text-muted-foreground space-y-1">
                {" "}
                <div className="font-medium text-foreground">
                  Controls:
                </div>{" "}
                <div>WASD or Arrow Keys to move</div>{" "}
                <div>Get close to others to chat</div>{" "}
              </div>{" "}
            </div>{" "}
            {/* Nearby Users */}{" "}
            {nearbyUsers.length > 0 && (
              <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border max-w-64">
                {" "}
                <div className="text-sm text-muted-foreground space-y-2">
                  {" "}
                  <div className="font-medium text-foreground flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Nearby Users:</span>
                  </div>{" "}
                  {nearbyUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 p-1 rounded hover:bg-accent/50 transition-colors"
                    >
                      {" "}
                      <Avatar className="w-6 h-6">
                        {" "}
                        <AvatarFallback
                          className={`text-xs text-white ${getUserColor(
                            user.id
                          )}`}
                        >
                          {" "}
                          {getUserAvatar(user.username)}{" "}
                        </AvatarFallback>{" "}
                      </Avatar>{" "}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-foreground font-medium truncate block">
                          {user.username}
                        </span>{" "}
                        <span className="text-xs text-muted-foreground">
                          Online
                        </span>
                      </div>
                    </div>
                  ))}{" "}
                </div>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
        {/* Chat Sidebar */}{" "}
        {showChat && (
          <div className="w-80 bg-card border-l border-border flex flex-col">
            {" "}
            <div className="p-4 border-b border-border">
              {" "}
              <h3 className="font-semibold text-foreground">Chat</h3>{" "}
            </div>{" "}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
            >
              {" "}
              {chatMessages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  {" "}
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    {" "}
                    <AvatarFallback
                      className={`text-white text-sm font-medium ${
                        message.userId === "system"
                          ? "bg-gray-500"
                          : getUserColor(message.userId)
                      }`}
                    >
                      {" "}
                      {message.userId === "system"
                        ? "⚙️"
                        : getUserAvatar(message.username)}{" "}
                    </AvatarFallback>{" "}
                  </Avatar>{" "}
                  <div className="flex-1 min-w-0">
                    {" "}
                    <div className="flex items-center space-x-2">
                      {" "}
                      <span
                        className={`text-sm font-medium ${
                          message.userId === "system"
                            ? "text-muted-foreground"
                            : message.userId === currentUserId
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {" "}
                        {message.username}{" "}
                        {message.userId === currentUserId && (
                          <span className="text-xs text-muted-foreground">
                            (You)
                          </span>
                        )}
                      </span>{" "}
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        {new Date(message.timestamp).toLocaleTimeString()}{" "}
                      </span>{" "}
                    </div>{" "}
                    <p
                      className={`text-sm break-words ${
                        message.userId === "system"
                          ? "text-muted-foreground italic"
                          : "text-foreground"
                      }`}
                    >
                      {message.message}
                    </p>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
              {chatMessages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start a conversation!</p>
                </div>
              )}
            </div>{" "}
            <div className="p-4 border-t border-border">
              {" "}
              <div className="flex space-x-2">
                {" "}
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                />{" "}
                <Button onClick={sendChatMessage} size="sm">
                  {" "}
                  <Send className="w-4 h-4" />{" "}
                </Button>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
}
