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

export interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  users: UserData[];
  currentUserId: string | null;
  nearbyUsers: UserData[];
  zoom: number;
}

interface Message {
  type: string;
  payload: any;
}

// Messages sent FROM client TO server
export interface OutgoingMessage extends Message {
  type: "JOIN_ROOM" | "LEAVE_ROOM" | "MOVEMENT" | "CHAT";
  payload: {
    user?: UserData;
    roomId?: string;
    message?: string;
    position?: Position;
    error?: string;
  };
}

// Messages received BY client FROM server
export interface IncomingMessage extends Message {
  type:
    | "ROOM_STATE"
    | "USER_JOINED"
    | "USER_LEFT"
    | "MOVEMENT"
    | "CHAT"
    | "ERROR"
    | "MOVEMENT_REJECTED";
  payload: {
    users?: UserData[];
    user?: UserData;
    userId?: string;
    username?: string;
    from?: string; // for CHAT messages
    chat?: string;
    position?: Position;
    roomId?: string;
    error?: string;
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}
