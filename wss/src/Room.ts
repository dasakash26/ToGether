import { OutgoingMessage } from "./types";
import { User } from "./User";

export class Room {
  private users: Map<string, User>; // userId -> User mapping
  private admins: Set<string>;
  private superAdmin: string | null;

  constructor(private id: string, private name: string = "Together Room") {
    console.log(`> Room created with ID: ${id} and Name: ${name}`);
    this.users = new Map<string, User>();
    this.admins = new Set<string>();
    this.superAdmin = null;
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

  addUser(user: User): void {
    const newUserData = user.getUserData();

    let existingUserRemoved = false;
    for (const [existingUserId, existingUser] of this.users) {
      if (existingUser.getUserData().username === newUserData.username) {
        console.log(
          `> Removing existing user ${newUserData.username} with old ID ${existingUserId}`
        );
        this.removeUser(existingUserId);
        existingUserRemoved = true;
        break;
      }
    }

    if (this.users.has(newUserData.id)) {
      console.warn(
        `> User ${newUserData.username} with ID ${newUserData.id} already exists in room ${this.id}`
      );
      return;
    }

    if (this.users.size === 0) {
      this.superAdmin = newUserData.id;
    }

    this.users.set(newUserData.id, user);
    user.joinRoom(this.id);

    console.log(
      `> User ${newUserData.username} (${newUserData.id}) ${
        existingUserRemoved ? "reconnected to" : "joined"
      } room ${this.id}`
    );

    // 1. sync state with the new user
    this.notify(newUserData.id, {
      type: "ROOM_STATE",
      payload: {
        users: this.getUsers().map((u) => u.getUserData()),
        roomId: this.id,
      },
    });

    // 2. notify others about the new user (only if it's a new join, not a reconnect)
    if (!existingUserRemoved) {
      this.notifyOthers(newUserData.id, {
        type: "USER_JOINED",
        payload: {
          user: newUserData,
          roomId: this.id,
        },
      });
    }
  }

  removeUser(userId: string): void {
    const user = this.users.get(userId);
    if (!user) {
      console.warn(`User with ID ${userId} not found in room ${this.id}`);
      return;
    }

    const userData = user.getUserData();

    // Handle super admin transfer
    if (userData.id === this.superAdmin) {
      this.admins.delete(userId);
      // Transfer super admin to another admin or the first remaining user
      if (this.admins.size > 0) {
        this.superAdmin = [...this.admins][0];
      } else if (this.users.size > 1) {
        // Find another user to be super admin
        for (const [id, u] of this.users) {
          if (id !== userId) {
            this.superAdmin = id;
            break;
          }
        }
      } else {
        this.superAdmin = null;
      }
    }

    user.leaveRoom();
    this.users.delete(userId);

    console.log(`User ${userData.username} (${userId}) left room ${this.id}`);

    this.notifyAll({
      type: "USER_LEFT",
      payload: {
        user: userData,
        roomId: this.id,
      },
    });
  }

  updateUserPosition(userId: string, position: { x: number; y: number }): void {
    const user = this.users.get(userId);
    if (!user) {
      console.warn(`User with ID ${userId} not found in room ${this.id}`);
      return;
    }

    if (user.updatePosition(position)) {
      this.notifyAll({
        type: "MOVEMENT",
        payload: {
          userId: userId,
          position,
          roomId: this.id,
        },
      });
    } else {
      this.notify(userId, {
        type: "MOVEMENT_REJECTED",
        payload: {
          error: "Invalid movement",
          position,
          roomId: this.id,
        },
      });
    }
  }

  notify(userId: string, message: OutgoingMessage): void {
    const user = this.getUser(userId);
    if (user) {
      user.send(message);
    } else {
      console.warn(`User with ID ${userId} not found in room ${this.id}`);
    }
  }

  notifyOthers(userId: string, message: OutgoingMessage): void {
    this.users.forEach((user) => {
      if (user.getUserData().id !== userId) {
        user.send(message);
      }
    });
  }

  notifyAll(message: OutgoingMessage): void {
    this.users.forEach((user) => {
      user.send(message);
    });
  }

  isAdmin(userId: string): boolean {
    return this.admins.has(userId);
  }

  isSuperAdmin(userId: string): boolean {
    return this.superAdmin === userId;
  }

  // Check : if the caller user is admin
  setAdmin(userId: string): void {
    if (this.users.has(userId)) {
      if (this.admins.size == 0) this.superAdmin = userId;
      this.admins.add(userId);
      console.log(`> User ${userId} set as admin in room ${this.name}`);
    } else {
      console.warn(`> User ${userId} not found in room ${this.name}`);
    }
  }

  // Check : if the caller user is admin
  demoteAdmin(userId: string): void {
    if (this.admins.has(userId)) {
      this.admins.delete(userId);
      console.log(`> User ${userId} demoted from admin in room ${this.name}`);
    } else {
      console.warn(`> User ${userId} is not an admin in room ${this.name}`);
    }
  }

  destroy(): void {
    this.users.forEach((user) => {
      user.leaveRoom();
    });
    this.users.clear();
    console.warn(`> Room ${this.name} (${this.id}) destroyed`);
  }
}
