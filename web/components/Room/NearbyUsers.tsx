"use client";

import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserData } from "@/types";
import { getUserAvatar, getUserColor } from "@/lib/room-utils";

interface NearbyUsersProps {
  nearbyUsers: UserData[];
}

export function NearbyUsers({ nearbyUsers }: NearbyUsersProps) {
  if (nearbyUsers.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border max-w-64">
      <div className="text-sm text-muted-foreground space-y-2">
        <div className="font-medium text-foreground flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>Nearby Users:</span>
        </div>
        {nearbyUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-2 p-1 rounded hover:bg-accent/50 transition-colors"
          >
            <Avatar className="w-6 h-6">
              <AvatarFallback
                className={`text-xs text-white ${getUserColor(user.id)}`}
              >
                {getUserAvatar(user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-foreground font-medium truncate block">
                {user.username}
              </span>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
