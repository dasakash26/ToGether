"use client";

import { ArrowLeft, Users, Radio, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserData } from "@/types";
import { getUserAvatar, getUserColor } from "@/lib/room-utils";

interface RoomHeaderProps {
  roomId: string;
  username: string;
  isConnected: boolean;
  users: UserData[];
  onLeaveRoom: () => void;
}

export function RoomHeader({
  roomId,
  username,
  isConnected,
  users,
  onLeaveRoom,
}: RoomHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-background/95 via-background/90 to-background/95 border-b border-border/50 backdrop-blur-xl shadow-lg p-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLeaveRoom}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave
          </Button>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-secondary-foreground font-semibold text-sm truncate">
              ToGether Room #{roomId}
            </h1>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                variant="default"
                className={`text-xs ${
                  isConnected
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                } transition-all duration-200 border`}
              >
                {isConnected ? (
                  <>
                    <Radio className="w-3 h-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" />
                    Disconnected
                  </>
                )}
              </Badge>

              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span className="text-xs font-medium">{users.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Welcome,{" "}
            <span className="text-foreground font-medium">{username}</span>
          </p>
          <Avatar className="w-8 h-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200">
            <AvatarFallback
              className={`text-xs font-semibold text-primary-foreground ${getUserColor(
                username
              )}`}
            >
              {getUserAvatar(username)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
