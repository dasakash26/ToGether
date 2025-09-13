export interface Position {
  x: number;
  y: number;
}

export interface UserData {
  id: string;
  username: string;
  position: Position;
  avatar?: string;
  roomId?: string | null;
}

interface Message {
  type: string;
  payload: any;
}

// Messages sent FROM client TO server
export interface IncomingMessage extends Message {
  type: "JOIN_ROOM" | "LEAVE_ROOM" | "MOVEMENT" | "CHAT";
  payload: {
    user?: UserData;
    userId?: string;
    roomId?: string;
    message?: string;
    position?: Position;
    error?: string;
  };
}

// Messages sent FROM server TO client
export interface OutgoingMessage extends Message {
  type:
    | "ROOM_STATE"
    | "USER_JOINED"
    | "USER_LEFT"
    | "MOVEMENT"
    | "MOVEMENT_REJECTED"
    | "CHAT"
    | "ERROR";
  payload: {
    from?: string;
    users?: UserData[];
    user?: UserData;
    userId?: string;
    username?: string;
    chat?: string;
    position?: Position;
    roomId?: string;
    error?: string;
  };
}

// Canvas dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
