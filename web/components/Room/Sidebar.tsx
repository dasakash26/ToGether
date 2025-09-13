"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Users,
  Settings,
  VideoIcon,
  MicIcon,
  PhoneOff,
  Send,
} from "lucide-react";
import { ChatMessage, UserData } from "@/types";
import { getUserAvatar, getUserColor } from "@/lib/room-utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatMessages: ChatMessage[];
  currentUserId: string | null;
  chatInput: string;
  setChatInput: (value: string) => void;
  sendChatMessage: () => void;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  users: UserData[];
}

function ChatTab(props: SidebarProps) {
  return (
    <div className="flex flex-col h-full p-2 mx-2">
      <ScrollArea className="flex-1">
        <div ref={props.chatContainerRef} className="space-y-2 pr-4">
          {props.chatMessages.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            props.chatMessages.map((message) => (
              <div key={message.id} className="flex gap-2 text-xs">
                <Avatar className="w-6 h-6 ml-2">
                  <AvatarFallback
                    className={`text-xs ${
                      message.userId === "system"
                        ? "bg-muted"
                        : getUserColor(message.userId)
                    }`}
                  >
                    {message.userId === "system"
                      ? "⚙️"
                      : getUserAvatar(message.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-xs truncate">
                      {message.username}
                      {message.userId === props.currentUserId && " (You)"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-foreground mt-1 break-words">
                    {message.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2 border-t pt-1 mb-4 min-w-0">
        <Input
          value={props.chatInput}
          onChange={(e) => props.setChatInput(e.target.value)}
          placeholder="Type a message..."
          className="text-xs flex-1 bg-primary"
          onKeyPress={(e) =>
            e.key === "Enter" && (e.preventDefault(), props.sendChatMessage())
          }
        />
        <Button onClick={props.sendChatMessage} size="sm" className="p-4 py-5">
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function UsersTab(props: SidebarProps) {
  return (
    <div className="p-4">
      <div className="space-y-3">
        {props.users && props.users.length > 0 ? (
          <>
            {props.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className={`text-sm ${getUserColor(user.id)}`}
                  >
                    {getUserAvatar(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {user.username}
                    {user.id === props.currentUserId && " (You)"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Online{user.id === props.currentUserId ? " • Host" : ""}
                  </p>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No participants</p>
            <p className="text-xs text-muted-foreground mt-1">
              Share your room link to invite others
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="p-4">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-3">Media Settings</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
            >
              <VideoIcon className="w-4 h-4 mr-2" />
              Camera Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
            >
              <MicIcon className="w-4 h-4 mr-2" />
              Audio Settings
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-3">Room Controls</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
            >
              <Settings className="w-4 h-4 mr-2" />
              Room Settings
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="w-full justify-start text-xs"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Leave Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <Sheet open={props.isOpen} onOpenChange={props.onClose}>
      <SheetContent
        side="right"
        className="w-80 p-0 bg-background border-border [&>button]:hidden"
      >
        <Tabs defaultValue="chat" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-3 mx-2 mt-4">
            <TabsTrigger value="chat" className="text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              Chat
              {props.chatMessages.length > 0 && (
                <Badge
                  variant="default"
                  className="ml-1 text-xs bg-primary/20 text-primary border-primary/30"
                >
                  {props.chatMessages.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Users
              {props.users && props.users.length > 0 && (
                <Badge
                  variant="default"
                  className="ml-1 text-xs bg-primary/20 text-primary border-primary/30"
                >
                  {props.users.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="h-full m-0 mt-4">
              <ChatTab {...props} />
            </TabsContent>

            <TabsContent value="users" className="h-full m-0 mt-4">
              <UsersTab {...props} />
            </TabsContent>

            <TabsContent value="settings" className="h-full m-0 mt-4">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
