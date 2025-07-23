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
    // will only be used for initial spawn position
    this.position = position;
  }

  updatePosition(position: Position): boolean {
    const dx = Math.abs(position.x - this.position.x);
    const dy = Math.abs(position.y - this.position.y);

    // TODO: remove true in prod
    if (true || (dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      this.position = position;
      return true;
    }

    return false;
  }

  send(message: OutgoingMessage): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      console.log(`Sending message to user ${this.username}:`, message);
      this.socket.send(JSON.stringify(message));
    } else {
      console.error(`socket is not open for user ${this.username}`);
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
    this.socket.close();
    if (!this.roomId) {
      return;
    }
    RoomManager.getInstance().removeUserFromRoom(this.roomId, this.id, false);
    console.log(`User ${this.username} destroyed`);
  }
}
