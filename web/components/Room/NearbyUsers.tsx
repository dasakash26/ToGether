"use client";

import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserData } from "@/types";
import { getUserAvatar, getUserColor } from "@/lib/room-utils";

interface NearbyUsersProps {
  nearbyUsers: UserData[];
}

export function NearbyUsers({ nearbyUsers }: NearbyUsersProps) {
  if (nearbyUsers.length === 0) return null;

  return (
    <Card className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border-2 border-blue-600/30 max-w-64">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>Nearby Users:</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {nearbyUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-2 p-1 rounded hover:bg-blue-800/20 transition-colors"
            >
              <Avatar className="w-6 h-6">
                <AvatarFallback
                  className={`text-xs text-white ${getUserColor(user.id)}`}
                >
                  {getUserAvatar(user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-blue-100 font-medium truncate block">
                  {user.username}
                </span>
                <span className="text-xs text-blue-300">Online</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
