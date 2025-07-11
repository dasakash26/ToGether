import { createId } from "@paralleldrive/cuid2";
import { Room } from "./Room";
import { User } from "./User";

export class RoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, Room>;

  private constructor() {
    this.rooms = new Map<string, Room>();
    console.log("RoomManager initialized");
  }

  static getInstance(): RoomManager {
    return this.instance ?? (this.instance = new RoomManager());
  }

  createRoom(roomName: string): Room {
    const roomId = createId();
    const room = new Room(roomId, roomName);
    this.rooms.set(roomId, room);

    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  addUserToRoom(roomId: string, user: User): void {
    let room = this.getRoom(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }
    room.addUser(user);
  }

  addToLobby(user: User): void {
    this.addUserToRoom("lobby", user);
    console.log(`User ${user.getId()} added to lobby`);
  }

  removeUserFromRoom(roomId: string, userId: string): void {
    const room = this.getRoom(roomId);
    if (room) {
      room.removeUser(userId);
    } else {
      console.warn(`Room with ID ${roomId} does not exist.`);
    }
  }

  updateUserPosition(
    roomId: string,
    userId: string,
    position: { x: number; y: number }
  ): void {
    const room = this.getRoom(roomId);
    if (room) {
      room.updateUserPosition(userId, position);
    } else {
      console.warn(`Room with ID ${roomId} does not exist.`);
    }
  }

  sendChatMessage(roomId: string, userId: string, chat: string): void {
    const room = this.getRoom(roomId);
    if (room) {
      room.sendChatMessage(userId, chat);
    } else {
      console.warn(`Room with ID ${roomId} does not exist.`);
    }
  }

  destroy(): void {
    this.rooms.forEach((room) => {
      room.destroy();
    });
    this.rooms.clear();
    console.log("RoomManager destroyed");
  }
}
