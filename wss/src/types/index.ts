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
export interface IncomingMessage extends Message {
  type: "JOIN_ROOM" | "LEAVE_ROOM" | "MOVEMENT" | "CHAT";
  payload: {
    user: UserData;
    roomId?: string;
    message?: string;
    position?: Position;
    error?: string;
  };
}
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
