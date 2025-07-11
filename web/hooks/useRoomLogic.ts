"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UserData, IncomingMessage, ChatMessage } from "@/types";
import {
  MOVE_SPEED,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  INTERACTION_DISTANCE,
} from "@/lib/room-utils";
import { useSearchParams } from "next/navigation";

interface UseRoomLogicProps {
  roomId: string;
  username: string;
}

export function useRoomLogic({ roomId, username }: UseRoomLogicProps) {
  const searchParams = useSearchParams();
  const wsRef = useRef<WebSocket | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<UserData[]>([]);
  const velocityRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const keyStateRef = useRef<{ [key: string]: boolean }>({});

  const currentUserId = searchParams.get("username");

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

  const handleWebSocketMessage = useCallback(
    (message: IncomingMessage) => {
      switch (message.type) {
        case "ROOM_STATE":
          setUsers(
            (message.payload.users || []).filter(
              (user, index, self) =>
                index === self.findIndex((u) => u.id === user.id)
            )
          );
          break;
        case "USER_JOINED":
          if (!message.payload.user) return;
          setUsers((prev) =>
            prev.some((u) => u.id === message.payload.user!.id)
              ? prev
              : [...prev, message.payload.user!]
          );
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
          break;
        case "USER_LEFT":
          if (!message.payload.userId) return;
          setUsers((prev) => {
            const leftUser = prev.find((u) => u.id === message.payload.userId);
            if (leftUser) {
              setChatMessages((chatPrev) => [
                ...chatPrev,
                {
                  id: `system-${Date.now()}`,
                  userId: "system",
                  username: "System",
                  message: `${leftUser.username} left the room`,
                  timestamp: Date.now(),
                },
              ]);
            }
            return prev.filter((user) => user.id !== message.payload.userId);
          });
          break;
        case "MOVEMENT":
          if (!message.payload.userId || !message.payload.position) return;
          setUsers((prev) =>
            prev.map((user) =>
              user.id === message.payload.userId
                ? { ...user, position: message.payload.position! }
                : user
            )
          );
          break;
        case "CHAT":
          if (
            !message.payload.userId ||
            !message.payload.username ||
            !message.payload.chat
          )
            return;
          setChatMessages((prev) => [
            ...prev,
            {
              id: `${message.payload.userId}-${Date.now()}`,
              userId: message.payload.userId!,
              username: message.payload.username!,
              message: message.payload.chat!,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "ERROR":
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
    [currentUserId]
  );

  useEffect(() => {
    if (!username?.trim()) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      console.error("WebSocket URL is not defined");
      return;
    }
    const finalUrl = new URL(
      `${wsUrl}?roomId=${roomId}&username=${encodeURIComponent(
        username.trim()
      )}`
    );

    const ws = new WebSocket(finalUrl.toString());
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: { roomId, username: username.trim() },
        })
      );
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };
    ws.onclose = () => setIsConnected(false);
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => ws.close();
  }, [roomId, username, handleWebSocketMessage]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { dx, dy } = velocityRef.current;
      if (dx === 0 && dy === 0) return;
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
      if (keyStateRef.current["w"] || keyStateRef.current["arrowup"])
        dy -= acceleration;
      if (keyStateRef.current["s"] || keyStateRef.current["arrowdown"])
        dy += acceleration;
      if (keyStateRef.current["a"] || keyStateRef.current["arrowleft"])
        dx -= acceleration;
      if (keyStateRef.current["d"] || keyStateRef.current["arrowright"])
        dx += acceleration;
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
      wsRef.current.send(JSON.stringify({ type: "LEAVE_ROOM", payload: {} }));
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
