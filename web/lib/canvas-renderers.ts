import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  INTERACTION_DISTANCE,
  getUserColor,
  getColorHex,
  getUserAvatar,
} from "./room-utils";
import type { UserData } from "../types";
import {
  DEFAULT_OFFICE_LAYOUT,
  type OfficeConfig,
  type FurnitureItem,
  COZY_OFFICE,
} from "./office-config";

export class BackgroundRenderer {
  private static currentLayout: OfficeConfig = DEFAULT_OFFICE_LAYOUT;

  public static setLayout(layout: OfficeConfig): void {
    this.currentLayout = layout;
  }

  public static renderOfficeSpace(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.currentLayout.floor.primaryColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.drawOfficeFloor(ctx);
    this.drawWalls(ctx);
    this.drawFurnitureFromConfig(ctx);
  }

  private static drawOfficeFloor(ctx: CanvasRenderingContext2D): void {
    const { tileSize, primaryColor, secondaryColor } = this.currentLayout.floor;

    for (let x = 0; x < CANVAS_WIDTH; x += tileSize) {
      for (let y = 0; y < CANVAS_HEIGHT; y += tileSize) {
        if ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0) {
          ctx.fillStyle = secondaryColor;
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }
    }

    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;

    for (let x = 0; x <= CANVAS_WIDTH; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  private static drawWalls(ctx: CanvasRenderingContext2D): void {
    const { thickness, color } = this.currentLayout.walls;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, CANVAS_WIDTH, thickness);
    ctx.fillRect(0, CANVAS_HEIGHT - thickness, CANVAS_WIDTH, thickness);
    ctx.fillRect(0, 0, thickness, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - thickness, 0, thickness, CANVAS_HEIGHT);

    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  private static drawFurnitureFromConfig(ctx: CanvasRenderingContext2D): void {
    // First pass: Draw furniture that should be behind (chairs, floor items)
    this.currentLayout.furniture.forEach((item: FurnitureItem) => {
      switch (item.type) {
        case "chair":
          this.drawChair(ctx, item.x, item.y);
          break;
        case "plant":
          this.drawPlant(ctx, item.x, item.y);
          break;
        case "bookshelf":
          this.drawBookshelf(
            ctx,
            item.x,
            item.y,
            item.width || 30,
            item.height || 180
          );
          break;
        case "whiteboard":
          this.drawWhiteboard(
            ctx,
            item.x,
            item.y,
            item.width || 15,
            item.height || 120
          );
          break;
      }
    });

    // Second pass: Draw furniture that should be on top (desks, tables)
    this.currentLayout.furniture.forEach((item: FurnitureItem) => {
      switch (item.type) {
        case "desk":
          this.drawDesk(
            ctx,
            item.x,
            item.y,
            item.width || 120,
            item.height || 60
          );
          break;
        case "table":
          this.drawTable(
            ctx,
            item.x,
            item.y,
            item.width || 100,
            item.height || 100
          );
          break;
      }
    });
  }

  private static drawDesk(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number = 120,
    height: number = 60
  ): void {
    // Draw shadow first
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(x + 3, y + height + 2, width, 8);
    ctx.restore();

    // Desk legs
    ctx.fillStyle = "#5d4e37";
    const legWidth = 6;
    const legHeight = 12;
    ctx.fillRect(x + 5, y + height, legWidth, legHeight);
    ctx.fillRect(x + width - 11, y + height, legWidth, legHeight);
    ctx.fillRect(x + 5, y - legHeight, legWidth, legHeight);
    ctx.fillRect(x + width - 11, y - legHeight, legWidth, legHeight);

    // Main desk surface with wood grain effect
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, "#d2b48c");
    gradient.addColorStop(0.2, "#a0522d");
    gradient.addColorStop(0.5, "#8b5a2b");
    gradient.addColorStop(0.8, "#654321");
    gradient.addColorStop(1, "#5d4e37");

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    // Wood grain lines
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 3; i++) {
      const lineY = y + (height / 4) * (i + 1);
      ctx.beginPath();
      ctx.moveTo(x + 5, lineY);
      ctx.lineTo(x + width - 5, lineY);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Desk border with beveled edge
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // Inner highlight for 3D effect
    ctx.strokeStyle = "#d2b48c";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);

    // Drawers
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(x + width - 18, y + 8, 12, 6);
    ctx.fillRect(x + width - 18, y + height - 14, 12, 6);

    // Drawer handles
    ctx.fillStyle = "#2d3748";
    ctx.fillRect(x + width - 15, y + 10, 6, 2);
    ctx.fillRect(x + width - 15, y + height - 12, 6, 2);
  }

  private static drawTable(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number = 100,
    height: number = 100
  ): void {
    // Draw shadow
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(x + 4, y + height + 2, width, 10);
    ctx.restore();

    // Table legs with 3D effect
    ctx.fillStyle = "#374151";
    const legSize = 10;
    const legHeight = 15;

    // Draw legs with highlights
    const drawLeg = (legX: number, legY: number) => {
      ctx.fillStyle = "#374151";
      ctx.fillRect(legX, legY, legSize, legHeight);
      ctx.fillStyle = "#4b5563";
      ctx.fillRect(legX, legY, legSize - 2, 2);
      ctx.fillRect(legX, legY, 2, legHeight);
    };

    drawLeg(x + 8, y + height);
    drawLeg(x + width - 18, y + height);
    drawLeg(x + 8, y - legHeight);
    drawLeg(x + width - 18, y - legHeight);

    // Table surface with realistic material
    const tableGradient = ctx.createRadialGradient(
      x + width / 2,
      y + height / 2,
      0,
      x + width / 2,
      y + height / 2,
      width / 1.5
    );
    tableGradient.addColorStop(0, "#e5e7eb");
    tableGradient.addColorStop(0.7, "#d1d5db");
    tableGradient.addColorStop(1, "#9ca3af");

    ctx.fillStyle = tableGradient;
    ctx.fillRect(x, y, width, height);

    // Table edge with 3D beveled effect
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);

    // Inner highlight
    ctx.strokeStyle = "#f3f4f6";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);

    // Table surface details (subtle wood grain or reflections)
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.4;
    for (let i = 1; i < 4; i++) {
      const lineY = y + (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x + 10, lineY);
      ctx.lineTo(x + width - 10, lineY);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  private static drawChair(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void {
    // Chair shadow
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(x + 2, y + 32, 32, 6);
    ctx.restore();

    // Chair legs with realistic proportions
    ctx.fillStyle = "#2d3748";
    const legWidth = 4;
    const legHeight = 12;

    // Draw legs with highlights
    const drawLeg = (legX: number, legY: number) => {
      ctx.fillStyle = "#2d3748";
      ctx.fillRect(legX, legY, legWidth, legHeight);
      ctx.fillStyle = "#4a5568";
      ctx.fillRect(legX, legY, 1, legHeight);
    };

    drawLeg(x + 4, y + 28);
    drawLeg(x + 26, y + 28);
    drawLeg(x + 4, y + 8);
    drawLeg(x + 26, y + 8);

    // Chair seat with padding effect
    const seatGradient = ctx.createRadialGradient(
      x + 15,
      y + 15,
      0,
      x + 15,
      y + 15,
      15
    );
    seatGradient.addColorStop(0, "#6b7280");
    seatGradient.addColorStop(0.7, "#4b5563");
    seatGradient.addColorStop(1, "#374151");

    ctx.fillStyle = seatGradient;
    ctx.fillRect(x, y, 30, 28);

    // Seat cushion details
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, 26, 24);

    // Seat highlight
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 3, y + 3, 24, 22);

    // Chair backrest with ergonomic curve
    const backGradient = ctx.createLinearGradient(
      x + 5,
      y - 15,
      x + 25,
      y - 15
    );
    backGradient.addColorStop(0, "#4b5563");
    backGradient.addColorStop(0.5, "#6b7280");
    backGradient.addColorStop(1, "#4b5563");

    ctx.fillStyle = backGradient;
    ctx.fillRect(x + 5, y - 15, 20, 18);

    // Backrest border
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 5, y - 15, 20, 18);

    // Backrest highlight
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 6, y - 14, 18, 16);

    // Ergonomic curve detail
    ctx.strokeStyle = "#4b5563";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + 15, y - 6, 8, 0, Math.PI, true);
    ctx.stroke();
  }

  private static drawWhiteboard(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number = 15,
    height: number = 120
  ): void {
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
  }

  private static drawBookshelf(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number = 30,
    height: number = 180
  ): void {
    ctx.fillStyle = "#92400e";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    const shelfHeight = height / 4;
    for (let i = 1; i < 4; i++) {
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + i * shelfHeight);
      ctx.lineTo(x + width, y + i * shelfHeight);
      ctx.stroke();
    }

    const bookColors = ["#dc2626", "#2563eb", "#059669", "#7c2d12", "#1e40af"];
    for (let shelf = 0; shelf < 4; shelf++) {
      for (let book = 0; book < 3; book++) {
        ctx.fillStyle = bookColors[book % bookColors.length];
        ctx.fillRect(
          x + 3 + book * 8,
          y + shelf * shelfHeight + 5,
          6,
          shelfHeight - 10
        );
      }
    }
  }

  private static drawPlant(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void {
    // Plant shadow
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(x - 10, y + 28, 20, 8);
    ctx.restore();

    // Pot with 3D effect
    const potGradient = ctx.createLinearGradient(x - 8, y + 15, x + 8, y + 30);
    potGradient.addColorStop(0, "#d97706");
    potGradient.addColorStop(0.5, "#a16207");
    potGradient.addColorStop(1, "#92400e");

    ctx.fillStyle = potGradient;
    ctx.fillRect(x - 8, y + 15, 16, 15);

    // Pot rim
    ctx.fillStyle = "#d97706";
    ctx.fillRect(x - 9, y + 14, 18, 3);

    // Pot highlights and shadows
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 7, y + 16, 2, 12);
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 5, y + 16, 2, 12);

    // Soil
    ctx.fillStyle = "#44403c";
    ctx.fillRect(x - 6, y + 16, 12, 3);

    // Main plant foliage with multiple layers for depth
    const drawFoliageLayer = (
      radius: number,
      color: string,
      offsetX: number = 0,
      offsetY: number = 0
    ) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, radius, 0, 2 * Math.PI);
      ctx.fill();
    };

    // Background layer (darkest)
    drawFoliageLayer(25, "#166534", 2, 3);

    // Middle layer
    drawFoliageLayer(22, "#15803d", -3, -1);

    // Top layer (brightest)
    drawFoliageLayer(18, "#22c55e", 1, -2);

    // Individual leaves for realism
    ctx.fillStyle = "#16a34a";
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const leafX = x + Math.cos(angle) * 15;
      const leafY = y + Math.sin(angle) * 12;
      ctx.save();
      ctx.translate(leafX, leafY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 4, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }

    // Highlight leaves
    ctx.fillStyle = "#34d399";
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI * 2) / 4 + 0.4;
      const leafX = x + Math.cos(angle) * 12;
      const leafY = y + Math.sin(angle) * 10;
      ctx.save();
      ctx.translate(leafX, leafY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 3, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }

    // Small stems
    ctx.strokeStyle = "#166534";
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const stemX = x + Math.cos(angle) * 8;
      const stemY = y + Math.sin(angle) * 6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(stemX, stemY);
      ctx.stroke();
    }
  }

  public static renderTitle(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";

    ctx.fillStyle = "#6b7280";
    ctx.font = "14px Arial";
    ctx.fillText(
      "Use arrow keys or WASD to move around the office",
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 30
    );
  }
}

export class UserRenderer {
  private static lightenColor(color: string, amount: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  private static darkenColor(color: string, amount: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;
    return (
      "#" +
      (
        0x1000000 +
        (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
        (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
        (B > 255 ? 255 : B < 0 ? 0 : B)
      )
        .toString(16)
        .slice(1)
    );
  }

  private static drawShadow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(x, y + 25, 18, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  private static drawBody(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isCurrentUser: boolean,
    userId: string
  ): void {
    const mainColor = isCurrentUser
      ? "#6366f1"
      : getColorHex(getUserColor(userId));
    const secondaryColor = isCurrentUser
      ? "#4f46e5"
      : this.darkenColor(mainColor, 0.15);

    ctx.save();

    const headGradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, 20);
    headGradient.addColorStop(0, this.lightenColor(mainColor, 0.2));
    headGradient.addColorStop(0.7, mainColor);
    headGradient.addColorStop(1, secondaryColor);

    ctx.fillStyle = headGradient;
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    const bodyGradient = ctx.createRadialGradient(
      x - 3,
      y + 12,
      0,
      x,
      y + 15,
      16
    );
    bodyGradient.addColorStop(0, this.lightenColor(secondaryColor, 0.1));
    bodyGradient.addColorStop(1, secondaryColor);

    ctx.globalAlpha = 0.9;
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(x, y + 15, 16, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  private static drawGlowEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void {
    ctx.save();

    const time = Date.now() / 1000;
    const pulse = Math.sin(time * 2) * 0.2 + 0.8;

    ctx.globalAlpha = 0.3 * pulse;
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.globalAlpha = 0.2 * pulse;
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  private static drawAvatar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    username: string,
    userImage: HTMLImageElement | null
  ): void {
    if (userImage) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(userImage, x - 18, y - 18, 36, 36);
      ctx.restore();
    } else {
      ctx.fillStyle = "white";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(getUserAvatar(username), x, y);
    }
  }

  private static drawUsername(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    username: string
  ): void {
    ctx.save();

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    const textMetrics = ctx.measureText(username);
    const textWidth = textMetrics.width;
    const padding = 6;
    ctx.fillRect(
      x - textWidth / 2 - padding,
      y + 30,
      textWidth + padding * 2,
      18
    );
    ctx.strokeRect(
      x - textWidth / 2 - padding,
      y + 30,
      textWidth + padding * 2,
      18
    );

    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(username, x, y + 33);
    ctx.restore();
  }

  private static drawCurrentUserIndicators(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void {
    ctx.fillStyle = "#2563eb";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("(You)", x, y + 52);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "14px Arial";
    ctx.fillText("👑", x - 15, y - 25);
  }

  private static drawStatusIndicator(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isCurrentUser: boolean
  ): void {
    const statusColor = isCurrentUser ? "#10b981" : "#06b6d4";

    ctx.save();
    const statusGradient = ctx.createRadialGradient(
      x + 12,
      y - 15,
      0,
      x + 12,
      y - 15,
      5
    );
    statusGradient.addColorStop(0, this.lightenColor(statusColor, 0.3));
    statusGradient.addColorStop(1, statusColor);

    ctx.fillStyle = statusGradient;
    ctx.beginPath();
    ctx.arc(x + 12, y - 15, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isCurrentUser) {
      const time = Date.now() / 1000;
      const pulse = Math.sin(time * 3) * 0.3 + 0.7;
      ctx.globalAlpha = pulse * 0.6;
      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + 12, y - 15, 8, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  private static drawInteractionRange(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void {
    ctx.save();

    const time = Date.now() / 1000;
    const pulse = Math.sin(time * 1.5) * 0.1 + 0.25;

    ctx.globalAlpha = pulse;
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 6]);
    ctx.beginPath();
    ctx.arc(x, y, INTERACTION_DISTANCE, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  public static render(
    ctx: CanvasRenderingContext2D,
    user: UserData,
    isCurrentUser: boolean,
    hasNearbyUsers: boolean,
    userImage: HTMLImageElement | null
  ): void {
    const { x, y } = user.position;

    this.drawShadow(ctx, x, y);
    this.drawBody(ctx, x, y, isCurrentUser, user.id);

    if (isCurrentUser) {
      this.drawGlowEffect(ctx, x, y);
    }

    this.drawAvatar(ctx, x, y, user.username, userImage);
    this.drawUsername(ctx, x, y, user.username);

    if (isCurrentUser) {
      this.drawCurrentUserIndicators(ctx, x, y);
    }

    this.drawStatusIndicator(ctx, x, y, isCurrentUser);

    if (isCurrentUser && hasNearbyUsers) {
      this.drawInteractionRange(ctx, x, y);
    }
  }
}
