"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Palette, ArrowRight, UserPlus, Hash } from "lucide-react";

export function JoinRoomCard() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const router = useRouter();

  const handleJoinRoom = () => {
    if (roomId.trim() && username.trim()) {
      router.push(`/room?id=${roomId}&username=${username}`);
    }
  };

  const handleCreateRoom = () => {
    if (username.trim()) {
      const newRoomId = Math.random().toString(36).substring(2, 8);
      router.push(`/room?id=${newRoomId}&username=${username}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-6 text-foreground">Together</h1>
        <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
          Move around and chat with others in shared spaces
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-2 bg-card">
        <CardHeader className="text-center pb-6">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Users className="w-6 h-6" />
            Join Room
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <UserPlus className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 h-12 text-base"
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
              />
            </div>

            <div className="relative">
              <Hash className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full pl-10 h-12 text-base"
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
              />
            </div>

            <Button
              onClick={handleJoinRoom}
              className="w-full h-12 text-base font-semibold"
              disabled={!roomId.trim() || !username.trim()}
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
              <span className="bg-card px-3 text-muted-foreground font-medium">
                or
              </span>
            </div>
          </div>

          <Button
            onClick={handleCreateRoom}
            variant="outline"
            className="w-full h-12 text-base font-semibold border-2"
            disabled={!username.trim()}
          >
            <Palette className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 text-center max-w-md">
        <p className="text-muted-foreground text-sm">
          Share the room ID to invite others to join your space.
        </p>
      </div>
    </div>
  );
}
