import WebSocket, { WebSocketServer } from "ws";
import { handleConnection, handleMessage } from "./Utils";
import dotenv from "dotenv";
dotenv.config();

const port = Number(process.env.PORT);
const wss = new WebSocketServer({ port });
let intervalId: NodeJS.Timeout;

wss.on("connection", (ws, req) => {
  console.log("Client connected");
  const user = handleConnection(ws, req.url);
  if (!user) {
    return;
  }
  //@ts-ignore
  ws.isAlive = true;

  ws.on("pong", (data) => {
    //@ts-ignore
    this.isAlive = true;
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
  }, 60000);
});

wss.on("close", () => {
  console.log("> Closing WebSocket server");
  clearInterval(intervalId);
});
