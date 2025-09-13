import WebSocket from "ws";
import { OutgoingMessage, Position, UserData } from "./types";
import { RoomManager } from "./RoomManager";

export class User {
  constructor(
    private id: string,
    private username: string,
    private position: Position,
    private socket: WebSocket,
    private avatar: string = "default-avatar",
    private roomId: string | null = null
  ) {}

  getUserData(): UserData {
    return {
      id: this.id,
      username: this.username,
      position: this.position,
      avatar: this.avatar,
      roomId: this.roomId,
    };
  }

  setPosition(position: Position): void {
    this.position = position;
  }

  updatePosition(position: Position): boolean {
    const dx = Math.abs(position.x - this.position.x);
    const dy = Math.abs(position.y - this.position.y);

    if (dx <= 100000 && dy <= 100000 && (dx > 0 || dy > 0)) {
      let newX = position.x;
      let newY = position.y;

      newX = Math.max(20, Math.min(780, newX));
      newY = Math.max(20, Math.min(580, newY));

      this.position = { x: newX, y: newY };
      return true;
    }

    return false;
  }

  send(message: OutgoingMessage): void {
    console.log(`Sending message to ${this.username}:`, message);
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error(`Socket not open for user ${this.username}`);
    }
  }

  joinRoom(roomId: string): void {
    console.log(`User ${this.username} joined room ${roomId}`);
    this.roomId = roomId;
  }

  leaveRoom(): void {
    console.log(`User ${this.username} left room ${this.roomId}`);
    this.roomId = null;
  }

  destroy(): void {
    if (
      this.socket.readyState === WebSocket.OPEN ||
      this.socket.readyState === WebSocket.CONNECTING
    ) {
      this.socket.close();
    }

    if (this.roomId) {
      try {
        RoomManager.getInstance().removeUserFromRoom(this.roomId, this.id);
      } catch (error) {
        console.error(
          `Error removing user ${this.username} from room ${this.roomId}:`,
          error
        );
      }
    }
    console.log(`User ${this.username} destroyed`);
  }
}
