import WebSocket, { WebSocketServer } from "ws";
import { handleConnection, handleMessage } from "./Utils";
import dotenv from "dotenv";
import { IncomingMessage } from "http";
import { verify } from "jsonwebtoken";
dotenv.config();

const port = Number(process.env.PORT);
const jwtSecret = process.env.JWT_SECRET;

const wss = new WebSocketServer({
  port,
  verifyClient: (info: {
    origin: string;
    secure: boolean;
    req: IncomingMessage;
  }) => {
    try {
      const url = new URL(info.req.url!, `http://localhost:${port}`);
      const token = url.searchParams.get("token");

      if (!token || !jwtSecret) {
        return false;
      }

      const decoded = verify(token, jwtSecret);
      if (typeof decoded === "string") {
        return false;
      }

      (info.req as any).decodedToken = decoded;
      return true;
    } catch (err) {
      return false;
    }
  },
});

let intervalId: NodeJS.Timeout;

wss.on("connection", (ws, req) => {
  console.log("Client connected");

  const decodedToken = (req as any).decodedToken;
  const user = handleConnection(ws, req.url, decodedToken);
  if (!user) {
    ws.close(4000, "Authentication failed");
    return;
  }

  //@ts-ignore
  ws.isAlive = true;

  ws.on("pong", (data) => {
    //@ts-ignore
    ws.isAlive = true;
    const elapsed = Date.now() - Number(data.toString());
    console.log(`> RTT: ${elapsed}ms`);
  });

  ws.on("message", (data: WebSocket.Data) => {
    handleMessage(user, data.toString());
  });

  ws.on("close", (code, reason) => {
    console.log(`Connection closed [${code}]: ${reason}`);
    user.destroy();
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
    user.destroy();
  });
});

wss.on("listening", () => {
  console.log(`> WebSocket server running on ws://localhost:${port}`);

  intervalId = setInterval(() => {
    wss.clients.forEach((ws) => {
      //@ts-ignore
      if (!ws.isAlive) ws.terminate();
      //@ts-ignore
      ws.isAlive = false;
      ws.ping(Date.now().toString());
    });
  }, 300000);
});

wss.on("close", () => {
  console.log("> Closing WebSocket server");
  clearInterval(intervalId);
});
