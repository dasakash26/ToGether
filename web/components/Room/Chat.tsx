"use client";

import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage } from "@/types";
import { getUserAvatar, getUserColor } from "@/lib/room-utils";

interface ChatPopupProps {
  chatMessages: ChatMessage[];
  currentUserId: string | null;
  chatInput: string;
  setChatInput: (value: string) => void;
  sendChatMessage: () => void;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPopup({
  chatMessages,
  currentUserId,
  chatInput,
  setChatInput,
  sendChatMessage,
  chatContainerRef,
  isOpen,
  onClose,
}: ChatPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 w-80 h-96 bg-card border border-border rounded-lg shadow-lg flex flex-col z-50 animate-in slide-in-from-bottom-2 duration-300">
      {/* Chat Header */}
      <div className="p-3 border-b border-border flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-4 h-4" />
          <h3 className="font-semibold text-foreground">Room Chat</h3>
          {chatMessages.length > 0 && (
            <Badge className="text-xs bg-secondary-background text-foreground">
              {chatMessages.length}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 text-lg leading-none"
        >
          ×
        </Button>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth"
      >
        {chatMessages.map((message) => (
          <div key={message.id} className="flex space-x-2">
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarFallback
                className={`text-white text-xs font-medium ${
                  message.userId === "system"
                    ? "bg-gray-500"
                    : getUserColor(message.userId)
                }`}
              >
                {message.userId === "system"
                  ? "⚙️"
                  : getUserAvatar(message.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-medium ${
                    message.userId === "system"
                      ? "text-muted-foreground"
                      : message.userId === currentUserId
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {message.username}
                  {message.userId === currentUserId && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (You)
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p
                className={`text-sm break-words mt-1 ${
                  message.userId === "system"
                    ? "text-muted-foreground italic"
                    : "text-foreground"
                }`}
              >
                {message.message}
              </p>
            </div>
          </div>
        ))}
        {chatMessages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages yet. Start a conversation!</p>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-3 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            className="text-sm"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendChatMessage();
              }
            }}
          />
          <Button onClick={sendChatMessage} size="sm" className="px-3">
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ChatButtonProps {
  onClick: () => void;
  messageCount: number;
}

export function ChatButton({ onClick, messageCount }: ChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg z-40 hover:scale-110 transition-transform duration-200"
      size="sm"
    >
      <MessageCircle className="w-6 h-6" />
      {messageCount > 0 && (
        <Badge
          variant="default"
          className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center bg-red-500 text-white animate-pulse"
        >
          {messageCount > 99 ? "99+" : messageCount}
        </Badge>
      )}
    </Button>
  );
}
