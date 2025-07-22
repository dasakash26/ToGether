import WebSocket from "ws";
import jwt from "jsonwebtoken";

const SERVER_PORT = 4000;
export const SERVER_URL = `ws://localhost:${SERVER_PORT}`;
const JWT_SECRET = "hehehe";

export const TEST_ROOMS = {
  DEFAULT: "test-room",
  PERFORMANCE: "performance-room",
  CHAT: "chat-room",
  MOVEMENT: "movement-room",
} as const;

function createTestToken(username: string, avatar?: string): string {
  return jwt.sign(
    {
      username,
      avatar: avatar || "default-avatar",
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

export function createAuthenticatedConnection(
  username: string,
  avatar?: string
): WebSocket {
  const token = createTestToken(username, avatar);
  return new WebSocket(`${SERVER_URL}?token=${token}`);
}

// Helper function to wait for WebSocket message
export function waitForMessage(
  ws: WebSocket,
  expectedType?: string,
  timeout: number = 5000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Message timeout after ${timeout}ms`));
    }, timeout);

    const messageHandler = (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        if (!expectedType || message.type === expectedType) {
          clearTimeout(timeoutId);
          ws.off("message", messageHandler);
          ws.off("error", errorHandler);
          resolve(message);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        ws.off("message", messageHandler);
        ws.off("error", errorHandler);
        reject(new Error("Failed to parse message"));
      }
    };

    const errorHandler = (err: Error) => {
      clearTimeout(timeoutId);
      ws.off("message", messageHandler);
      ws.off("error", errorHandler);
      reject(err);
    };

    ws.on("message", messageHandler);
    ws.on("error", errorHandler);
  });
}

// Helper function to wait for WebSocket connection to open
export function waitForConnection(ws: WebSocket): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error("Connection timeout"));
    }, 3000);

    ws.on("open", () => {
      clearTimeout(timeout);
      resolve();
    });

    ws.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// Helper function to join a room and wait for confirmation
export function joinRoom(
  ws: WebSocket,
  roomId: string,
  x: number = 100,
  y: number = 100
): Promise<any> {
  return new Promise((resolve, reject) => {
    ws.send(
      JSON.stringify({
        type: "JOIN_ROOM",
        roomId,
        x,
        y,
      })
    );

    waitForMessage(ws, "USER_JOINED", 2000).then(resolve).catch(reject);
  });
}

// Helper function to send movement and wait for confirmation
export function sendMovement(
  ws: WebSocket,
  x: number,
  y: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    ws.send(
      JSON.stringify({
        type: "MOVEMENT",
        x,
        y,
      })
    );

    // Movement doesn't send back confirmation, just resolve
    setTimeout(resolve, 100);
  });
}

// Helper function to send chat message
export function sendChatMessage(ws: WebSocket, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ws.send(
      JSON.stringify({
        type: "CHAT",
        message,
      })
    );

    // Chat doesn't send back confirmation to sender, just resolve
    setTimeout(resolve, 100);
  });
}

// Helper function to cleanup WebSocket connections
export function cleanupConnections(connections: WebSocket[]): void {
  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });
}
