"use client";

import { useCallback, useEffect, useState } from "react";
import { UserData, GameCanvasProps } from "@/types";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/room-utils";
import { BackgroundRenderer, UserRenderer } from "@/lib/canvas-renderers";
import { useCanvasAnimation, useImageLoader } from "@/hooks/useCanvas";

export function GameCanvas({
  canvasRef,
  users,
  currentUserId,
  nearbyUsers,
  zoom,
}: GameCanvasProps) {
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const {
    image: userImage,
    loading,
    error,
  } = useImageLoader(
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFDkJUFqMsrpTau0Uppfd9Moiguym4B2bcfA&s"
  );

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      let width = rect.width;
      let height = rect.height;

      if (width <= 0 || height <= 0) {
        width = window.innerWidth;
        height = window.innerHeight - 88;
      }

      const maxWidth = window.innerWidth;
      const maxHeight = window.innerHeight - 88;

      width = Math.min(width, maxWidth);
      height = Math.min(height, maxHeight);

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      setCanvasSize({ width, height });
    };

    const timeoutId = setTimeout(updateCanvasSize, 0);

    window.addEventListener("resize", updateCanvasSize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [canvasRef]);

  useEffect(() => {
    if (!currentUserId) return;

    const currentUser = users.find((user) => user.id === currentUserId);
    if (!currentUser || canvasSize.width === 0 || canvasSize.height === 0)
      return;

    const targetCameraX = currentUser.position.x - canvasSize.width / 2 / zoom;
    const targetCameraY = currentUser.position.y - canvasSize.height / 2 / zoom;

    const minCameraX = 0;
    const maxCameraX = Math.max(0, CANVAS_WIDTH - canvasSize.width / zoom);
    const minCameraY = 0;
    const maxCameraY = Math.max(0, CANVAS_HEIGHT - canvasSize.height / zoom);

    const clampedX = Math.max(minCameraX, Math.min(maxCameraX, targetCameraX));
    const clampedY = Math.max(minCameraY, Math.min(maxCameraY, targetCameraY));

    setCamera({ x: clampedX, y: clampedY });
  }, [users, currentUserId, zoom, canvasSize]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-camera.x, -camera.y);

    BackgroundRenderer.renderOfficeSpace(ctx);

    users.forEach((user) => {
      const isCurrentUser = user.id === currentUserId;
      const hasNearbyUsers = isCurrentUser && nearbyUsers.length > 0;

      UserRenderer.render(ctx, user, isCurrentUser, hasNearbyUsers, userImage);
    });

    BackgroundRenderer.renderTitle(ctx);

    ctx.restore();
  }, [
    users,
    currentUserId,
    nearbyUsers,
    userImage,
    canvasRef,
    zoom,
    camera,
    canvasSize,
  ]);

  useCanvasAnimation({
    drawFunction: drawGame,
    dependencies: [
      users,
      currentUserId,
      nearbyUsers,
      userImage,
      zoom,
      camera,
      canvasSize,
    ],
  });

  if (error) {
    console.warn("Failed to load user image:", error);
  }

  return (
    <canvas
      ref={canvasRef}
      className="border-0 rounded-lg focus:outline-none w-full h-full block max-w-full max-h-full"
      tabIndex={0}
    />
  );
}

export { CANVAS_WIDTH, CANVAS_HEIGHT };
