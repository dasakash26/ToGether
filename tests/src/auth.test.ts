import WebSocket from "ws";
import { describe, it, expect } from "vitest";
import { createAuthenticatedConnection, SERVER_URL } from "./helpers";

describe("Authentication", () => {
  it("rejects websocket connection when no authentication token provided", () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(SERVER_URL);

      ws.on("close", (code, reason) => {
        // When verifyClient returns false, WebSocket closes with 1006 (abnormal closure)
        expect(code).toBe(1006);
        resolve();
      });

      ws.on("open", () => {
        reject(new Error("Connection should have been rejected"));
      });

      ws.on("error", () => {
        // Expected for rejected connections
        resolve();
      });
    });
  });

  it("rejects websocket connection when invalid JWT token provided", () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`${SERVER_URL}?token=invalid-token`);

      ws.on("close", (code, reason) => {
        // When verifyClient returns false, WebSocket closes with 1006 (abnormal closure)
        expect(code).toBe(1006);
        resolve();
      });

      ws.on("open", () => {
        reject(new Error("Connection should have been rejected"));
      });

      ws.on("error", () => {
        // Expected for rejected connections
        resolve();
      });
    });
  });

  it("accepts websocket connection when valid JWT token provided", () => {
    return new Promise<void>((resolve, reject) => {
      const ws = createAuthenticatedConnection("testuser");

      ws.on("open", () => {
        ws.close();
        resolve();
      });

      ws.on("error", (err) => {
        reject(err);
      });

      ws.on("close", (code) => {
        if (code !== 1000) {
          // 1000 is normal closure
          reject(new Error(`Unexpected close code: ${code}`));
        }
      });
    });
  });
});
