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
    <div className="bg-gradient-to-r from-card via-card/98 to-card/95 shadow-lg border-b border-border/50 backdrop-blur-md">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="px-6 py-4">
          {/* Main Row - All Info */}
          <div className="flex justify-between items-center">
            {/* Left Side - Leave Button and Room Info with Status */}
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                onClick={onLeaveRoom}
                variant="ghost"
                className="hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Leave Room
              </Button>
              <div className="h-6 w-px bg-border/50" />
              <div className="flex items-center space-x-2">
                <Badge
                  variant={isConnected ? "default" : "neutral"}
                  className={`flex items-center space-x-2 px-3 py-1 transition-all ${
                    isConnected
                      ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 shadow-green-500/20"
                      : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 shadow-red-500/20"
                  }`}
                >
                  {isConnected ? (
                    <Radio className="w-3 h-3 animate-pulse" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  <span className="font-medium">
                    {roomId} • {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </Badge>
              </div>
            </div>

            {/* Right Side - User Info and Avatars */}
            <div className="flex items-center space-x-4">
              <Badge
                variant="default"
                className="flex items-center space-x-2 px-3 py-1"
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">
                  {users.length === 1
                    ? username
                    : `${username} and ${users.length - 1} other${
                        users.length - 1 === 1 ? "" : "s"
                      }`}
                </span>
              </Badge>
              {users.length > 0 && (
                <div className="flex items-center space-x-1">
                  {users.slice(0, 4).map((user, index) => (
                    <Avatar
                      key={user.id}
                      className={`w-8 h-8 ring-2 ring-background transition-transform hover:scale-110 ${
                        index > 0 ? "-ml-2" : ""
                      }`}
                      style={{ zIndex: users.length - index }}
                    >
                      <AvatarFallback
                        className={`text-xs text-white font-semibold ${getUserColor(
                          user.id
                        )}`}
                        title={user.username}
                      >
                        {getUserAvatar(user.username)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {users.length > 4 && (
                    <div className="ml-1 text-xs text-muted-foreground bg-muted/80 px-2 py-1 rounded-full font-medium">
                      +{users.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="px-4 py-3">
          {/* Top Row - Leave Button and Room Status */}
          <div className="flex justify-between items-center mb-3">
            <Button
              size="sm"
              onClick={onLeaveRoom}
              variant="ghost"
              className="hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Leave
            </Button>
            <Badge
              variant={isConnected ? "default" : "neutral"}
              className={`flex items-center space-x-1 px-2 py-1 ${
                isConnected
                  ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
                  : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
              }`}
            >
              {isConnected ? (
                <Radio className="w-3 h-3 animate-pulse" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <span className="text-xs font-medium">
                {roomId} • {isConnected ? "Connected" : "Offline"}
              </span>
            </Badge>
          </div>

          {/* Bottom Row - User Info and Avatars */}
          <div className="flex justify-between items-center">
            <Badge variant="default" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {users.length === 1
                ? username
                : `${username} & ${users.length - 1} other${
                    users.length - 1 === 1 ? "" : "s"
                  }`}
            </Badge>
            {users.length > 0 && (
              <div className="flex items-center">
                {users.slice(0, 3).map((user, index) => (
                  <Avatar
                    key={user.id}
                    className={`w-6 h-6 ring-1 ring-background ${
                      index > 0 ? "-ml-1" : ""
                    }`}
                    style={{ zIndex: users.length - index }}
                  >
                    <AvatarFallback
                      className={`text-xs text-white font-medium ${getUserColor(
                        user.id
                      )}`}
                      title={user.username}
                    >
                      {getUserAvatar(user.username)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {users.length > 3 && (
                  <div className="ml-1 text-xs text-muted-foreground bg-muted/80 px-1 py-0.5 rounded-full">
                    +{users.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
