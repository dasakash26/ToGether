"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { GameCanvas } from "@/components/Room/GameCanvas";
import { NearbyUsers } from "@/components/Room/NearbyUsers";
import { ZoomControls } from "@/components/Room/ZoomControls";
import { Sidebar } from "@/components/Room/Sidebar";
import { RoomHeader } from "@/components/Room/RoomHeader";
import { Footer } from "@/components/Room/Footer";
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
  const [zoom, setZoom] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    if (chatInput.trim()) {
      sendChatMessage(chatInput);
      setChatInput("");
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push("/");
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleToggleMute = () => setIsMuted((prev) => !prev);
  const handleToggleVideo = () => setIsVideoOff((prev) => !prev);

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
    <main className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      <RoomHeader
        roomId={roomId}
        username={username}
        isConnected={isConnected}
        users={users}
        onLeaveRoom={handleLeaveRoom}
      />

      <section className="flex-1 relative overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          chatMessages={chatMessages}
          currentUserId={currentUserId}
          chatInput={chatInput}
          setChatInput={setChatInput}
          sendChatMessage={handleSendChatMessage}
          chatContainerRef={chatContainerRef}
          users={users}
        />

        <section className="absolute inset-0 overflow-hidden">
          <div className="w-full h-full relative overflow-hidden">
            <GameCanvas
              canvasRef={canvasRef}
              users={users}
              currentUserId={currentUserId}
              nearbyUsers={nearbyUsers}
              zoom={zoom}
            />

            <ZoomControls
              zoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            />

            <NearbyUsers nearbyUsers={nearbyUsers} />
          </div>
        </section>
      </section>

      <section className="h-18 flex-shrink-0">
        <Footer
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </section>
    </main>
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
