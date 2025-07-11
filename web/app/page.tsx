"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Palette, ArrowRight } from "lucide-react";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`);
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    router.push(`/room/${newRoomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Welcome to <span className="text-primary">Together</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Collaborate in real-time with shared spaces and chat
          </p>
        </div>

        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Join a Room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full"
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
              />
              <Button
                onClick={handleJoinRoom}
                className="w-full"
                disabled={!roomId.trim()}
              >
                Join Room
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <Button
              onClick={handleCreateRoom}
              variant="outline"
              className="w-full"
            >
              <Palette className="w-4 h-4 mr-2" />
              Create New Room
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Share the room ID with others to collaborate together
          </p>
        </div>
      </div>
    </div>
  );
}
