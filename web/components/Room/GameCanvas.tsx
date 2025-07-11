"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UserData } from "@/types";
import {
  getUserColor,
  getColorHex,
  getUserAvatar,
  GRID_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  INTERACTION_DISTANCE,
} from "@/lib/room-utils";

interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  users: UserData[];
  currentUserId: string | null;
  nearbyUsers: UserData[];
}

export function GameCanvas({
  canvasRef,
  users,
  currentUserId,
  nearbyUsers,
}: GameCanvasProps) {
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setUserImage(img);
    img.src =
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFDkJUFqMsrpTau0Uppfd9Moiguym4B2bcfA&s";
    return () => {
      setUserImage(null);
    };
  }, []);

  const drawUser = useCallback(
    (ctx: CanvasRenderingContext2D, user: UserData, isCurrentUser: boolean) => {
      const x = user.position.x;
      const y = user.position.y;

      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);

      if (isCurrentUser) {
        ctx.fillStyle = "#2563eb";
        ctx.strokeStyle = "#2563eb";
      } else {
        const userColorClass = getUserColor(user.id);
        const userColor = getColorHex(userColorClass);
        ctx.fillStyle = userColor;
        ctx.strokeStyle = userColor;
      }

      ctx.fill();
      ctx.lineWidth = 3;
      ctx.stroke();

      if (userImage) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(userImage, x - 18, y - 18, 36, 36);
        ctx.restore();
      } else {
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(getUserAvatar(user.username), x, y);
      }

      ctx.fillStyle = "#374151";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(user.username, x, y + 25);

      if (isCurrentUser) {
        ctx.fillStyle = "#2563eb";
        ctx.font = "bold 10px Arial";
        ctx.fillText("(You)", x, y + 40);
      }

      if (isCurrentUser && nearbyUsers.length > 0) {
        ctx.beginPath();
        ctx.arc(x, y, INTERACTION_DISTANCE, 0, 2 * Math.PI);
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    },
    [nearbyUsers, userImage]
  );

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = "#e4e4e7";
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    users.forEach((user) => {
      const isCurrentUser = user.id === currentUserId;
      drawUser(ctx, user, isCurrentUser);
    });
  }, [users, currentUserId, drawUser, canvasRef]);

  useEffect(() => {
    drawGame();
  }, [drawGame]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="border-0 rounded-lg focus:outline-none"
      tabIndex={0}
    />
  );
}

export { CANVAS_WIDTH, CANVAS_HEIGHT };
