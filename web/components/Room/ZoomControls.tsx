"use client";

import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  minZoom?: number;
  maxZoom?: number;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  minZoom = 0.5,
  maxZoom = 2,
}: ZoomControlsProps) {
  const buttonClass =
    "bg-slate-900/90 backdrop-blur-sm border-2 border-blue-600/30 hover:bg-blue-800/30 shadow-lg text-blue-200 hover:text-white";

  return (
    <TooltipProvider>
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onZoomIn}
              disabled={zoom >= maxZoom}
              className={buttonClass}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onZoomOut}
              disabled={zoom <= minZoom}
              className={buttonClass}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>

        <Card className="bg-slate-900/90 backdrop-blur-sm border-2 border-blue-600/30 shadow-lg p-2">
          <div className="text-xs text-center text-blue-200">
            {Math.round(zoom * 100)}%
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}
