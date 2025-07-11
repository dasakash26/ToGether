import WebSocket from "ws";
import { OutgoingMessage, Position, UserData } from "./types";
import { RoomManager } from "./RoomManager";

const DefaultAvatar =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4rKRQxr3DV0rklb33iS58Mksg66LOSnWFQw&s";

export class User {
  constructor(
    private id: string,
    private username: string,
    private position: Position,
    private socket: WebSocket,
    private avatar: string = DefaultAvatar,
    private roomId: string = "lobby"
  ) {
    RoomManager.getInstance().addToLobby(this);
  }

  getId(): string {
    return this.id;
  }

  getPosition(): Position {
    return this.position;
  }

  getUser(): UserData {
    return {
      id: this.id,
      username: this.username,
      position: this.position,
      avatar: this.avatar,
      roomId: this.roomId,
    };
  }

  send(message: OutgoingMessage): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      console.log(`Sending message to user ${this.username}:`, message);
      // Ensure the message is a valid
      this.socket.send(JSON.stringify(message));
    } else {
      console.error(`socket is not open for user ${this.username}`);
    }
  }

  updatePosition(position: Position): boolean {
    const dx = Math.abs(position.x - this.position.x);
    const dy = Math.abs(position.y - this.position.y);

    if (true||(dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      this.position = position;
      return true;
    }

    return false;
  }

  joinRoom(roomId: string): void {
    console.log(`User ${this.username} joined room ${roomId}`);
    this.roomId = roomId;
  }

  leaveRoom(): void {
    console.log(`User ${this.username} left room ${this.roomId}`);
    RoomManager.getInstance().addToLobby(this);
  }

  destroy(): void {
    this.socket.close();
    if (!this.roomId) {
      return;
    }
    RoomManager.getInstance().removeUserFromRoom(this.roomId, this.id);
    console.log(`User ${this.username} destroyed`);
  }
}
