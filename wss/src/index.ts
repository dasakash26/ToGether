import { WebSocketServer } from "ws";
import { User } from "./User";
import { handleMessage } from "./messageHandler";
import { createId } from "@paralleldrive/cuid2";
import { RoomManager } from "./RoomManager";
import { IncomingMessage } from "./types";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const wss: WebSocketServer = new WebSocketServer({ port });

wss.on("connection", (ws) => {
  console.log("Client connected");

  const userId = createId();
  const username = `User-${userId.substring(0, 4)}`;
  const position = {
    x: Math.floor(Math.random() * 600) + 100, // Random position within canvas bounds
    y: Math.floor(Math.random() * 400) + 100, // Random position within canvas bounds
  };
  const user = new User(userId, username, position, ws);
  // Don't automatically add to lobby - wait for JOIN_ROOM message

  ws.on("message", (message: IncomingMessage) => {
    console.log(`Received: ${message}`);
    handleMessage(user, message.toString());
  });

  ws.on("close", () => {
    user?.destroy();
  });
});

console.log("WebSocket server running on ws://localhost:" + port);
