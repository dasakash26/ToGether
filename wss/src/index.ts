import { WebSocketServer } from "ws";
import { User } from "./User";
import { handleMessage } from "./messageHandler";
import { IncomingMessage } from "./types";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const wss: WebSocketServer = new WebSocketServer({ port });

/*const finalUrl = new URL(
      wsUrl +
        "?roomId=" +
        roomId +
        "&username=" +
        encodeURIComponent(username.trim())
    );
 */
wss.on("connection", (ws, req) => {
  console.log("Client connected");

  let roomId = "lobby";
  let username = "Guest";

  if (req.url) {
    try {
      const url = new URL(req.url, `http://localhost:${port}`);
      roomId = url.searchParams.get("roomId") || "lobby";
      username = url.searchParams.get("username") || "Guest";
    } catch (error) {
      console.warn("Failed to parse URL parameters:", error);
    }
  }

  const position = {
    x: Math.floor(Math.random() * 600) + 100,
    y: Math.floor(Math.random() * 400) + 100,
  };
  const user = new User(username, username, position, ws, roomId);

  ws.on("message", (message: IncomingMessage) => {
    handleMessage(user, message.toString());
  });

  ws.on("close", () => {
    user?.destroy();
  });
});

console.log(">> WebSocket server running on ws://localhost:" + port);
