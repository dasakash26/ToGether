"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  Menu,
} from "lucide-react";

interface FooterProps {
  isMuted?: boolean;
  isVideoOff?: boolean;
  onToggleMute?: () => void;
  onToggleVideo?: () => void;
  onOpenSidebar?: () => void;
  userVideoStream?: MediaStream | null;
}

export function Footer({
  isMuted = false,
  isVideoOff = false,
  onToggleMute,
  onToggleVideo,
  onOpenSidebar,
  userVideoStream,
}: FooterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && userVideoStream) {
      videoRef.current.srcObject = userVideoStream;
    }
  }, [userVideoStream]);
  return (
    <footer className="w-full h-full border-t border-slate-800/60 bg-gradient-to-r from-slate-950/98 via-slate-900/98 to-slate-950/98 backdrop-blur-xl shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none"></div>
      <TooltipProvider>
        <div className="relative flex items-center justify-between px-6 py-4 h-full">
          <div className="flex items-center gap-4">
            <div className="relative w-28 h-20 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm ring-1 ring-slate-600/20">
              {userVideoStream && !isVideoOff ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                  <VideoOffIcon className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-slate-100 text-xs text-center py-1.5 font-medium">
                You
              </div>
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-500 rounded-full border border-green-400 animate-pulse shadow-lg"></div>
              </div>
            </div>

            {/* Media controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMute}
                className={`h-10 w-10 p-0 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  isMuted
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg ring-2 ring-red-500/30"
                    : "bg-gradient-to-r from-slate-800/90 to-slate-700/90 hover:from-slate-700 hover:to-slate-600 text-slate-300 hover:text-white shadow-lg ring-1 ring-slate-600/30 backdrop-blur-sm"
                }`}
              >
                {isMuted ? (
                  <MicOffIcon className="w-4 h-4" />
                ) : (
                  <MicIcon className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleVideo}
                className={`h-10 w-10 p-0 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  isVideoOff
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg ring-2 ring-red-500/30"
                    : "bg-gradient-to-r from-slate-800/90 to-slate-700/90 hover:from-slate-700 hover:to-slate-600 text-slate-300 hover:text-white shadow-lg ring-1 ring-slate-600/30 backdrop-blur-sm"
                }`}
              >
                {isVideoOff ? (
                  <VideoOffIcon className="w-4 h-4" />
                ) : (
                  <VideoIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Right side - Menu button */}
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenSidebar}
                  className="h-10 w-10 p-0 rounded-full bg-gradient-to-r from-slate-800/90 to-slate-700/90 hover:from-slate-700 hover:to-slate-600 text-slate-300 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-lg ring-1 ring-slate-600/30 backdrop-blur-sm"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-slate-800 text-slate-100 border-slate-700"
              >
                <p>Open sidebar menu</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </footer>
  );
}
