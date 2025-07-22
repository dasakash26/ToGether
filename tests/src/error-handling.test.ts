import WebSocket from "ws";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createAuthenticatedConnection,
  waitForMessage,
  waitForConnection,
} from "./helpers";

describe("Error Handling", () => {
  let ws: WebSocket;

  beforeEach(async () => {
    ws = createAuthenticatedConnection("erroruser");
    await waitForConnection(ws);
  });

  afterEach(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  it("returns error response when malformed JSON message sent", async () => {
    ws.send("invalid json{");

    const message = await waitForMessage(ws, "ERROR");
    expect(message.type).toBe("ERROR");
    expect(message.payload.error).toBe("Invalid message format");
  });

  it("returns error response when unknown message type sent", async () => {
    ws.send(
      JSON.stringify({
        type: "UNKNOWN_TYPE",
        payload: {},
      })
    );

    const message = await waitForMessage(ws, "ERROR");
    expect(message.type).toBe("ERROR");
    expect(message.payload.error).toBe("Unknown message type");
  });
});
