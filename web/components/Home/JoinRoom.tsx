import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Palette, ArrowRight, UserPlus, Hash } from "lucide-react";
import { Separator } from "../ui/separator";

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
        <h1 className="text-6xl font-bold mb-6 text-foreground">
          Welcome to{" "}
          <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-primary">
            Together
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
          Collaborate in real-time with shared spaces and chat
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Real-time collaboration</span>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span>Creative workspace</span>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-xl border-2 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Users className="w-6 h-6 text-primary" />
            Join a Room
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <UserPlus className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your username"
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
                placeholder="Enter room ID"
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
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">
                or
              </span>
            </div>
          </div>

          <Button
            onClick={handleCreateRoom}
            variant="neutral"
            className="w-full h-12 text-base font-semibold border-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            disabled={!username.trim()}
          >
            <Palette className="w-4 h-4 mr-2" />
            Create New Room
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 text-center max-w-md">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Share the room ID with others to collaborate together. Your username
          will be visible to other participants.
        </p>
      </div>
    </div>
  );
}
