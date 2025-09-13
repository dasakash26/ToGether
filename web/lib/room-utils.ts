export const getUserAvatar = (username: string): string => {
  if (!username) return "?";
  return username.charAt(0).toUpperCase();
};

export const getUserColor = (userId: string): string => {
  const colors = [
    "bg-emerald-500",
    "bg-cyan-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-lime-500",
    "bg-fuchsia-500",
    "bg-sky-500",
    "bg-orange-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-pink-500",
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const getColorHex = (colorClass: string): string => {
  const colorMap = {
    "bg-emerald-500": "#10b981",
    "bg-cyan-500": "#06b6d4",
    "bg-violet-500": "#8b5cf6",
    "bg-rose-500": "#f43f5e",
    "bg-amber-500": "#f59e0b",
    "bg-lime-500": "#84cc16",
    "bg-fuchsia-500": "#d946ef",
    "bg-sky-500": "#0ea5e9",
    "bg-orange-500": "#f97316",
    "bg-indigo-500": "#6366f1",
    "bg-teal-500": "#14b8a6",
    "bg-pink-500": "#ec4899",
  };
  return colorMap[colorClass as keyof typeof colorMap] || "#6366f1";
};

// Game constants
export const CANVAS_WIDTH = 1430;
export const CANVAS_HEIGHT = 760;
export const MOVE_SPEED = 5;
export const INTERACTION_DISTANCE = 80;
