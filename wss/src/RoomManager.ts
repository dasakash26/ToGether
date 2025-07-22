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

  createRoom(roomName: string, roomId?: string): Room {
    const id = roomId || createId();
    const room = new Room(id, roomName);
    this.rooms.set(id, room);

    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  addUserToRoom(roomId: string, user: User): void {
    let room = this.getRoom(roomId);
    if (!room) {
      room = this.createRoom(roomId, roomId);
    }
    room.addUser(user);
  }

  // Check: if forced check if caller admin or not
  // Check: superAdmin of a room can't be removed forcefully
  removeUserFromRoom(roomId: string, userId: string, forced:boolean = true): void {
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

  destroy(): void {
    this.rooms.forEach((room) => {
      room.destroy();
    });
    this.rooms.clear();
    console.log("RoomManager destroyed");
  }
}
