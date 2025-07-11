import { User } from "./User";
import { RoomManager } from "./RoomManager";
import { IncomingMessage, Position } from "./types";

export function handleMessage(user: User, rawMessage: string): void {
  try {
    const message: IncomingMessage = JSON.parse(rawMessage);
    const roomManager = RoomManager.getInstance();
    console.log(">> ", message.type);
    switch (message.type) {
      case "JOIN_ROOM": {
        const roomId = message.payload.roomId;
        console.log(
          "JOIN_ROOM received for room:",
          roomId,
          "user:",
          user.getId()
        );
        if (roomId) {
          roomManager.addUserToRoom(roomId, user);
          console.log(
            "User added to room. Room empty?",
            RoomManager.getInstance().getRoom(roomId)?.isEmpty()
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
        const userData = user.getUser();
        if (userData.roomId) {
          roomManager.removeUserFromRoom(userData.roomId, user.getId());
        }
        break;
      }

      case "MOVEMENT": {
        const userData = user.getUser();
        const position = message.payload.position;

        if (userData.roomId && position) {
          roomManager.updateUserPosition(
            userData.roomId,
            user.getId(),
            position as Position
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
        const userData = user.getUser();
        const chatMessage = message.payload.message;

        if (userData.roomId && chatMessage) {
          roomManager.sendChatMessage(
            userData.roomId,
            user.getId(),
            chatMessage
          );
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
