import { JwtPayload, verify } from "jsonwebtoken";
import { Position } from "./types";
import { User } from "./User";
import WebSocket from "ws";
import { RoomManager } from "./RoomManager";
import { IncomingMessage } from "./types";
import cuid2 from "@paralleldrive/cuid2";
import dotenv from "dotenv";
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT;

export function generateSpawnPosition(): Position {
  const position = {
    x: Math.floor(Math.random() * 600) + 100,
    y: Math.floor(Math.random() * 400) + 100,
  };

  return position;
}

export function handleConnection(
  ws: WebSocket,
  urlString: string | undefined,
  claims?: JwtPayload
): User | null {
  if (!jwtSecret || !port) {
    console.error("> JWT_SECRET and PORT environment variable must be set");
    process.exit(1);
  }

  if (!claims || !claims.username) {
    console.error("> Invalid JWT claims");
    return null;
  }

  const { username, avatar } = claims;
  const spawnPos = generateSpawnPosition();
  const id = cuid2.createId();
  const user = new User(id, username, spawnPos, ws, avatar);

  return user;
}

export function handleMessage(user: User, rawMessage: string): void {
  try {
    let message: IncomingMessage;
    try {
      message = JSON.parse(rawMessage);
    } catch (err) {
      user.send({
        type: "ERROR",
        payload: { error: "Invalid message format" },
      });
      return;
    }
    const roomManagerInstance = RoomManager.getInstance();
    console.log("> ", message);
    switch (message.type) {
      case "JOIN_ROOM": {
        const {roomId, position } = message.payload;
        if(position){
          user.setPosition(position);
        }
        if (roomId) {
          roomManagerInstance.addUserToRoom(roomId, user);
          console.log(
            "User added to room of size?",
            roomManagerInstance.getRoom(roomId)?.getUserCount()
          );
        } else {
          user.send({
            type: "ERROR",
            payload: { error: "Room ID is required" },
          });
        }
        break;
      }

      case "LEAVE_ROOM": {
        const userData = user.getUserData();
        if (userData.roomId) {
          roomManagerInstance.removeUserFromRoom(
            userData.roomId,
            user.getUserData().id
          );
        }
        break;
      }

      case "MOVEMENT": {
        const userData = user.getUserData();
        const position = message.payload?.position;

        if (userData.roomId && position) {
          roomManagerInstance.updateUserPosition(
            userData.roomId,
            user.getUserData().id,
            position
          );
        } else {
          user.send({
            type: "ERROR",
            payload: { error: "Not in a room or invalid position" },
          });
        }
        break;
      }

      case "CHAT": {
        const userData = user.getUserData();
        const chatMessage = message.payload?.message;
        const sendTo = message.payload.userId;
        if (userData.roomId && chatMessage) {
          if (sendTo) {
            // private message
            roomManagerInstance.getRoom(userData.roomId)?.notify(sendTo, {
              type: "CHAT",
              payload: {
                from: userData.id,
                chat: chatMessage,
              },
            });
          } else {
            // broadcast message
            roomManagerInstance
              .getRoom(userData.roomId)
              ?.notifyOthers(userData.id, {
                type: "CHAT",
                payload: {
                  from: userData.id,
                  chat: chatMessage,
                },
              });
          }
        } else {
          user.send({
            type: "ERROR",
            payload: { error: "Not in a room or empty message" },
          });
        }
        break;
      }

      default:
        user.send({
          type: "ERROR",
          payload: { error: "Unknown message type" },
        });
    }
  } catch (err) {
    console.error("Error processing message:", err);
    user.send({
      type: "ERROR",
      payload: { error: "Invalid message format" },
    });
  }
}
