"use client";

export function GameControls() {
  return (
    <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
      <div className="text-sm text-muted-foreground space-y-1">
        <div className="font-medium text-foreground">Controls:</div>
        <div>WASD or Arrow Keys to move</div>
        <div>Get close to others to chat</div>
      </div>
    </div>
  );
}
