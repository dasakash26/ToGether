"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { GameCanvas } from "@/components/Room/GameCanvas";
import { ChatPopup, ChatButton } from "@/components/Room/Chat";
import { NearbyUsers } from "@/components/Room/NearbyUsers";
import { RoomHeader } from "@/components/Room/RoomHeader";
import { useRoomLogic } from "@/hooks/useRoomLogic";

function RoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const username = searchParams.get("username");
  const roomIdFromUrl = searchParams.get("id");
  const roomId = roomIdFromUrl as string;

  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);

  const {
    users,
    currentUserId,
    chatMessages,
    isConnected,
    nearbyUsers,
    sendChatMessage,
    leaveRoom,
  } = useRoomLogic({ roomId, username: username || "" });

  useEffect(() => {
    if (!username?.trim()) {
      router.push("/");
      return;
    }
  }, [username, router]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendChatMessage = () => {
    sendChatMessage(chatInput);
    setChatInput("");
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push("/");
  };

  if (!username?.trim()) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-4 text-foreground">
            Username Required
          </h1>
          <p className="text-muted-foreground mb-6">
            Please enter a username to continue to the room.
          </p>
          <Button onClick={() => router.push("/")} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <RoomHeader
        roomId={roomId}
        username={username}
        isConnected={isConnected}
        users={users}
        onLeaveRoom={handleLeaveRoom}
      />

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="relative bg-card rounded-lg shadow-xl border-2">
            <GameCanvas
              canvasRef={canvasRef}
              users={users}
              currentUserId={currentUserId}
              nearbyUsers={nearbyUsers}
            />
            <NearbyUsers nearbyUsers={nearbyUsers} />
          </div>
        </div>
      </div>

      <ChatButton
        onClick={() => setShowChat(!showChat)}
        messageCount={chatMessages.length}
      />

      <ChatPopup
        chatMessages={chatMessages}
        currentUserId={currentUserId}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendChatMessage={handleSendChatMessage}
        chatContainerRef={chatContainerRef}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  );
}

export default function Room() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-background flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
