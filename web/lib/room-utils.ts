
export const getUserAvatar = (username: string): string => {
  if (!username) return "?";
  return username.charAt(0).toUpperCase();
};

export const getUserColor = (userId: string): string => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const index =
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

export const getColorHex = (colorClass: string): string => {
  const colorMap = {
    "bg-red-500": "#ef4444",
    "bg-blue-500": "#3b82f6",
    "bg-green-500": "#22c55e",
    "bg-purple-500": "#a855f7",
    "bg-orange-500": "#f97316",
    "bg-pink-500": "#ec4899",
    "bg-indigo-500": "#6366f1",
    "bg-teal-500": "#14b8a6",
  };
  return colorMap[colorClass as keyof typeof colorMap] || "#6b7280";
};

// Game constants
export const GRID_SIZE = 40;
export const CANVAS_WIDTH = 1400;
export const CANVAS_HEIGHT = 700;
export const MOVE_SPEED = 5;
export const INTERACTION_DISTANCE = 100;
