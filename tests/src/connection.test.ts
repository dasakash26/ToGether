import WebSocket from "ws";
import { describe, it, expect } from "vitest";
import {
  createAuthenticatedConnection,
  waitForMessage,
  waitForConnection,
} from "./helpers";

describe("Connection Management", () => {
  it("maintains stability during rapid connection and disconnection cycles", async () => {
    const connections: WebSocket[] = [];
    const usernames = ["rapid1", "rapid2", "rapid3"];

    // Create multiple connections rapidly
    for (const username of usernames) {
      const ws = createAuthenticatedConnection(username);
      connections.push(ws);
      await waitForConnection(ws);
    }

    // All join the same room
    for (const ws of connections) {
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: { roomId: "rapid-room" },
        })
      );
      await waitForMessage(ws, "ROOM_STATE");
    }

    // Close all connections
    connections.forEach((ws) => ws.close());

    // All should close without errors
    const closePromises = connections.map(
      (ws) =>
        new Promise<void>((resolve) => {
          ws.on("close", () => resolve());
        })
    );

    await Promise.all(closePromises);
  });

  it("should maintain room state consistency during concurrent operations", async () => {
    const ws1 = createAuthenticatedConnection("concurrent1");
    const ws2 = createAuthenticatedConnection("concurrent2");

    await Promise.all([waitForConnection(ws1), waitForConnection(ws2)]);

    // Both try to join room simultaneously
    const roomId = "concurrent-room";

    ws1.send(
      JSON.stringify({
        type: "JOIN_ROOM",
        payload: { roomId },
      })
    );

    ws2.send(
      JSON.stringify({
        type: "JOIN_ROOM",
        payload: { roomId },
      })
    );

    // Both should receive valid room states
    const [state1, state2] = await Promise.all([
      waitForMessage(ws1, "ROOM_STATE"),
      waitForMessage(ws2, "ROOM_STATE"),
    ]);

    expect(state1.payload.users).toBeDefined();
    expect(state2.payload.users).toBeDefined();
    expect(state2.payload.users).toHaveLength(2);

    ws1.close();
    ws2.close();
  });
});
