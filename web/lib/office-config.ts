import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./room-utils";

export interface FurnitureItem {
  type: "desk" | "table" | "plant" | "chair" | "whiteboard" | "bookshelf";
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
}

export interface OfficeConfig {
  furniture: FurnitureItem[];
  walls: {
    thickness: number;
    color: string;
  };
  floor: {
    tileSize: number;
    primaryColor: string;
    secondaryColor: string;
  };
  theme: {
    name: string;
    description: string;
  };
}

export const MODERN_OFFICE: OfficeConfig = {
  theme: {
    name: "Modern Office",
    description:
      "A contemporary workspace with clean lines and modern furniture",
  },
  furniture: [
    // Work stations with desks and chairs
    { type: "desk", x: 200, y: 150, width: 120, height: 60 },
    { type: "chair", x: 230, y: 120 },
    { type: "desk", x: 600, y: 150, width: 120, height: 60 },
    { type: "chair", x: 630, y: 120 },
    { type: "desk", x: 1000, y: 150, width: 120, height: 60 },
    { type: "chair", x: 1030, y: 120 },

    // Conference tables with chairs
    { type: "table", x: 400, y: 400, width: 140, height: 100 },
    { type: "chair", x: 380, y: 380 },
    { type: "chair", x: 420, y: 380 },
    { type: "chair", x: 460, y: 380 },
    { type: "chair", x: 500, y: 380 },
    { type: "chair", x: 380, y: 520 },
    { type: "chair", x: 420, y: 520 },
    { type: "chair", x: 460, y: 520 },
    { type: "chair", x: 500, y: 520 },

    // Second meeting area
    { type: "table", x: 800, y: 500, width: 140, height: 100 },
    { type: "chair", x: 780, y: 480 },
    { type: "chair", x: 820, y: 480 },
    { type: "chair", x: 860, y: 480 },
    { type: "chair", x: 900, y: 480 },
    { type: "chair", x: 780, y: 620 },
    { type: "chair", x: 820, y: 620 },
    { type: "chair", x: 860, y: 620 },
    { type: "chair", x: 900, y: 620 },

    // Office equipment
    { type: "whiteboard", x: 50, y: 300, width: 15, height: 120 },
    { type: "bookshelf", x: 1350, y: 200, width: 30, height: 180 },
    { type: "bookshelf", x: 1350, y: 400, width: 30, height: 180 },

    // Plants for ambiance
    { type: "plant", x: 100, y: 100 },
    { type: "plant", x: CANVAS_WIDTH - 100, y: 100 },
    { type: "plant", x: 100, y: CANVAS_HEIGHT - 100 },
    { type: "plant", x: CANVAS_WIDTH - 100, y: CANVAS_HEIGHT - 100 },
    { type: "plant", x: 300, y: 300 },
    { type: "plant", x: 900, y: 300 },
    { type: "plant", x: 600, y: 580 },
    { type: "plant", x: 1200, y: 450 },
  ],
  walls: {
    thickness: 20,
    color: "#374151",
  },
  floor: {
    tileSize: 80,
    primaryColor: "#f8fafc",
    secondaryColor: "#e2e8f0",
  },
};

export const COZY_OFFICE: OfficeConfig = {
  theme: {
    name: "Cozy Office",
    description: "A warm and inviting workspace with earth tones",
  },
  furniture: [
    { type: "desk", x: 250, y: 200, width: 140, height: 80 },
    { type: "chair", x: 285, y: 170 },
    { type: "desk", x: 700, y: 200, width: 140, height: 80 },
    { type: "chair", x: 735, y: 170 },

    { type: "table", x: 450, y: 450, width: 120, height: 120 },
    { type: "chair", x: 430, y: 430 },
    { type: "chair", x: 470, y: 430 },
    { type: "chair", x: 510, y: 430 },

    { type: "bookshelf", x: 100, y: 150, width: 35, height: 200 },
    { type: "bookshelf", x: 1250, y: 150, width: 35, height: 200 },
    { type: "whiteboard", x: 50, y: 400, width: 20, height: 150 },

    { type: "plant", x: 150, y: 120 },
    { type: "plant", x: 1200, y: 120 },
    { type: "plant", x: 150, y: 550 },
    { type: "plant", x: 1200, y: 550 },
    { type: "plant", x: 600, y: 350 },
  ],
  walls: {
    thickness: 25,
    color: "#92400e",
  },
  floor: {
    tileSize: 60,
    primaryColor: "#fef3c7",
    secondaryColor: "#fde68a",
  },
};

// Export the default layout
export const DEFAULT_OFFICE_LAYOUT = MODERN_OFFICE;
