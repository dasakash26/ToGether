"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { UserData, IncomingMessage, ChatMessage } from "@/types";
import {
  MOVE_SPEED,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  INTERACTION_DISTANCE,
} from "@/lib/room-utils";

interface UseRoomLogicProps {
  roomId: string;
  username: string;
}

export function useRoomLogic({ roomId, username }: UseRoomLogicProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<UserData[]>([]);
  const velocityRef = useRef({ dx: 0, dy: 0 });
  const keyStateRef = useRef<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const updateNearbyUsers = useCallback(() => {
    const currentUser = users.find((u) => u.id === currentUserId);
    if (!currentUser) return;

    const nearby = users.filter((user) => {
      if (user.id === currentUserId) return false;
      const distance = Math.hypot(
        user.position.x - currentUser.position.x,
        user.position.y - currentUser.position.y
      );
      return distance <= INTERACTION_DISTANCE;
    });
    setNearbyUsers(nearby);
  }, [users, currentUserId]);

  const addSystemMessage = useCallback((message: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: `system-${Date.now()}`,
        userId: "system",
        username: "System",
        message,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const handleWebSocketMessage = useCallback(
    (message: IncomingMessage) => {
      switch (message.type) {
        case "ROOM_STATE": {
          const newUsers = (message.payload.users || []).filter(
            (user, index, self) =>
              index === self.findIndex((u) => u.id === user.id)
          );
          setUsers(newUsers);

          const currentUser = newUsers.find((u) => u.username === username);
          if (currentUser) {
            setCurrentUserId(currentUser.id);
          }
          break;
        }

        case "USER_JOINED": {
          const { user } = message.payload;
          if (!user) return;

          setUsers((prev) =>
            prev.some((u) => u.id === user.id) ? prev : [...prev, user]
          );
          addSystemMessage(`${user.username} joined the room`);
          break;
        }

        case "USER_LEFT": {
          //@ts-ignore
          const userId  = message.payload.user?.id;
          if (!userId) return;
          setUsers((prev) => {
            const leftUser = prev.find((u) => u.id === userId);
            if (leftUser) {
              addSystemMessage(`${leftUser.username} left the room`);
            }
            return prev.filter((user) => user.id !== userId);
          });
          break;
        }

        case "MOVEMENT": {
          const { userId, position } = message.payload;
          if (!userId || !position) return;

          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, position } : user
            )
          );
          break;
        }

        case "CHAT": {
          const { from, username: senderUsername, chat } = message.payload;
          if (!from || !senderUsername || !chat) return;

          setChatMessages((prev) => [
            ...prev,
            {
              id: `${from}-${Date.now()}`,
              userId: from,
              username: senderUsername,
              message: chat,
              timestamp: Date.now(),
            },
          ]);
          break;
        }

        case "ERROR": {
          const { error } = message.payload;
          addSystemMessage(`Error: ${error}`);
          break;
        }

        case "MOVEMENT_REJECTED": {
          const { error } = message.payload;
          addSystemMessage(`Movement blocked: ${error}`);
          break;
        }
      }
    },
    [username, addSystemMessage]
  );

  const connectWebSocket = useCallback(async () => {
    if (!roomId || !username) {
      console.error("Room ID or username is missing");
      return;
    }

    // Prevent multiple simultaneous connections
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    // Close any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      console.error("WebSocket URL is not defined");
      return;
    }

    try {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, roomId }),
      });

      const { token } = await res.json();
      if (!token) {
        console.error("Failed to fetch token");
        return;
      }

      const finalUrl = new URL(`${wsUrl}?token=${token}`);
      const ws = new WebSocket(finalUrl.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        ws.send(
          JSON.stringify({
            type: "JOIN_ROOM",
            payload: { roomId },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} ${event.reason}`);
        setIsConnected(false);
        wsRef.current = null;
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        wsRef.current = null;
      };
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      wsRef.current = null;
    }
  }, [roomId, username, handleWebSocketMessage]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        console.log("Cleaning up WebSocket connection");
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { dx, dy } = velocityRef.current;
      if ((dx === 0 && dy === 0) || !currentUserId) return;

      setUsers((prev) => {
        return prev.map((user) => {
          if (user.id !== currentUserId) return user;

          let newX = user.position.x + dx;
          let newY = user.position.y + dy;

          newX = Math.max(20, Math.min(CANVAS_WIDTH - 20, newX));
          newY = Math.max(20, Math.min(CANVAS_HEIGHT - 20, newY));

          const newPosition = { x: newX, y: newY };

          wsRef.current?.send(
            JSON.stringify({
              type: "MOVEMENT",
              payload: { position: newPosition },
            })
          );

          return { ...user, position: newPosition };
        });
      });
    }, 40);

    return () => clearInterval(interval);
  }, [currentUserId]);

  useEffect(() => {
    const acceleration = MOVE_SPEED * 2;

    const updateVelocity = () => {
      let dx = 0,
        dy = 0;

      const keys = keyStateRef.current;
      if (keys.w || keys.arrowup) dy -= acceleration;
      if (keys.s || keys.arrowdown) dy += acceleration;
      if (keys.a || keys.arrowleft) dx -= acceleration;
      if (keys.d || keys.arrowright) dx += acceleration;

      velocityRef.current = { dx, dy };
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keyStateRef.current[e.key.toLowerCase()] = true;
      updateVelocity();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      delete keyStateRef.current[e.key.toLowerCase()];
      updateVelocity();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    updateNearbyUsers();
  }, [updateNearbyUsers]);

  const sendChatMessage = useCallback((message: string) => {
    if (message.trim() && wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "CHAT",
          payload: { message: message.trim() },
        })
      );
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "LEAVE_ROOM",
          payload: {},
        })
      );
    }
  }, []);

  return {
    users,
    currentUserId,
    chatMessages,
    isConnected,
    nearbyUsers,
    sendChatMessage,
    leaveRoom,
  };
}
