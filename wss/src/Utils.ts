import { JwtPayload, verify } from "jsonwebtoken";
import { Position } from "./types";
import { User } from "./User";
import WebSocket from "ws";
import { RoomManager } from "./RoomManager";
import { IncomingMessage } from "./types";
import cuid2 from "@paralleldrive/cuid2";
import dotenv from "dotenv"
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
): User | null {
  
  if (!jwtSecret||!port) {
    console.error("> JWT_SECRET and PORT environment variable must be set");
    process.exit(1);
  }

  let token: string | null = null;

  if (urlString) {
    try {
      const url = new URL(urlString, `http://localhost:${port}`);
      token = url.searchParams.get("token");
    } catch (e) {
      console.warn("Error parsing URL:", e);
    }
  }

  if (!token) {
    console.warn("No token provided, closing connection");
    ws.close(4000, "Authentication required");
    return null;
  }

  let claims: JwtPayload;
  try {
    const decoded = verify(token, jwtSecret!);
    if (typeof decoded === "string") {
      throw new Error("Unexpected token payload");
    }
    claims = decoded;
  } catch (err: any) {
    console.warn("JWT verification failed:", err.message);
    ws.close(4001, "Invalid token");
    return null;
  }

  // Create the User
  const { username, avatar } = claims;
  const spawnPos = generateSpawnPosition();
  const id = cuid2.createId();
  const user = new User(id, username, spawnPos, ws, avatar);

  return user;
}

export function handleMessage(user: User, rawMessage: string): void {
  try {
    const message: IncomingMessage = JSON.parse(rawMessage);
    const roomManagerInstance = RoomManager.getInstance();
    console.log("> ", message.type);
    switch (message.type) {
      case "JOIN_ROOM": {
        const roomId = message.payload.roomId;
        console.log(
          "JOIN_ROOM received for room:",
          roomId,
          "user:",
          user.getUserData().username
        );

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
        const position = message.payload.position;

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
        const chatMessage = message.payload.message;
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
