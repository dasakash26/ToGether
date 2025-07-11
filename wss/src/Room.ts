import { OutgoingMessage } from "./types";
import { User } from "./User";

export class Room {
  private users: Map<string, User>;

  constructor(private id: string, private name: string) {
    console.log(`Room created with ID: ${id} and Name: ${name}`);
    this.users = new Map<string, User>();
    //send room state
    setInterval(() => {
      this.users.forEach((user) => {
        user.send({
          type: "ROOM_STATE",
          payload: {
            users: this.getUsers().map((u) => u.getUser()),
            roomId: this.id,
            currentUserId: user.getId(), 
          },
        });
      });
      console.log(`Room state sent to all users in room ${this.id}`);
      console.log(`Room ${this.name} (${this.id}) has ${this.getUserCount()} users`);
    }, 20000); 


  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  addUser(user: User): void {
    if(this.users.has(user.getId())) {
      console.warn(`User with ID ${user.getId()} already exists in room ${this.id}`);
      return;
    }
    this.users.set(user.getId(), user);
    user.joinRoom(this.id);

    user.send({
      type: "ROOM_STATE",
      payload: {
        users: this.getUsers().map((u) => u.getUser()),
        roomId: this.id,
        currentUserId: user.getId(), 
      },
    });

    this.broadcast({
      type: "USER_JOINED",
      payload: {
        user: user.getUser(),
        roomId: this.id,
      },
    });
  }

  removeUser(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      user.leaveRoom();
      this.users.delete(userId);

      this.broadcast({
        type: "USER_LEFT",
        payload: {
          user: user.getUser(),
          roomId: this.id,
        },
      });
    }
  }

  updateUserPosition(userId: string, position: { x: number; y: number }): void {
    const user = this.users.get(userId);
    if (!user) {
      console.warn(`User with ID ${userId} not found in room ${this.id}`);
      return;
    }

    if (user.updatePosition(position)) {
      this.broadcast({
        type: "MOVEMENT",
        payload: {
          userId: userId,
          position,
          roomId: this.id,
        },
      });
    } else {
      user.send({
        type: "MOVEMENT_REJECTED",
        payload: {
          error: "Invalid movement",
          position,
          roomId: this.id,
        },
      });
    }
  }

  sendChatMessage(userId: string, chat: string): void {
    const user = this.users.get(userId);
    if (!user) {
      console.warn(`User with ID ${userId} not found in room ${this.id}`);
      return;
    }

    this.broadcast({
      type: "CHAT",
      payload: {
        userId: userId,
        username: user.getUser().username,
        chat,
        roomId: this.id,
      },
    });
  }

  broadcast(message: OutgoingMessage): void {
    this.users.forEach((user) => {
      user.send(message);
    });
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getUserCount(): number {
    return this.users.size;
  }

  isEmpty(): boolean {
    return this.users.size === 0;
  }

  destroy(): void {
    this.users.forEach((user) => {
      user.leaveRoom();
    });
    this.users.clear();
    console.log(`Room ${this.name} (${this.id}) destroyed`);
  }
}
