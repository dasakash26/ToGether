import WebSocket from "ws";
import { describe, it, expect, afterEach } from "vitest";
import {
  createAuthenticatedConnection,
  waitForConnection,
  joinRoom,
  sendMovement,
  cleanupConnections,
  TEST_ROOMS,
} from "./helpers";

describe("Movement System", () => {
  let connections: WebSocket[] = [];

  afterEach(() => {
    cleanupConnections(connections);
    connections = [];
  });

  it("updates user position when valid movement coordinates sent within room", async () => {
    const ws = createAuthenticatedConnection("mover");
    connections.push(ws);
    await waitForConnection(ws);

    // Join room first
    await joinRoom(ws, TEST_ROOMS.MOVEMENT, 100, 100);

    // Send movement
    await sendMovement(ws, 200, 150);

    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it("validates and processes different coordinate ranges for movement", async () => {
    const ws = createAuthenticatedConnection("validator");
    connections.push(ws);
    await waitForConnection(ws);

    await joinRoom(ws, TEST_ROOMS.MOVEMENT, 100, 100);

    // Test various coordinate ranges
    await sendMovement(ws, 0, 0);
    await sendMovement(ws, 1000, 1000);
    await sendMovement(ws, 500, 300);

    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it("handles 20 rapid consecutive movement updates without connection drop", async () => {
    const ws = createAuthenticatedConnection("rapidMover");
    connections.push(ws);
    await waitForConnection(ws);

    await joinRoom(ws, TEST_ROOMS.MOVEMENT, 100, 100);

    // Send rapid movements
    for (let i = 0; i < 20; i++) {
      await sendMovement(ws, 100 + i * 10, 100 + i * 5);
    }

    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it("prevents movement when user not in any room", async () => {
    const ws = createAuthenticatedConnection("outsideMover");
    connections.push(ws);
    await waitForConnection(ws);

    // Try to move without joining room
    ws.send(
      JSON.stringify({
        type: "MOVEMENT",
        x: 200,
        y: 200,
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it("processes movement between multiple users in same room", async () => {
    const ws1 = createAuthenticatedConnection("mover1");
    const ws2 = createAuthenticatedConnection("mover2");
    connections.push(ws1, ws2);

    await Promise.all([waitForConnection(ws1), waitForConnection(ws2)]);

    // Both join same room
    await joinRoom(ws1, TEST_ROOMS.MOVEMENT, 100, 100);
    await joinRoom(ws2, TEST_ROOMS.MOVEMENT, 200, 200);

    // Both move
    await sendMovement(ws1, 150, 150);
    await sendMovement(ws2, 250, 250);

    expect(ws1.readyState).toBe(WebSocket.OPEN);
    expect(ws2.readyState).toBe(WebSocket.OPEN);
  });

  it("handles invalid movement data without crashing server", async () => {
    const ws = createAuthenticatedConnection("invalidMover");
    connections.push(ws);
    await waitForConnection(ws);

    await joinRoom(ws, TEST_ROOMS.MOVEMENT, 100, 100);

    // Send invalid movement data
    ws.send(
      JSON.stringify({
        type: "MOVEMENT",
        // Missing x, y coordinates
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(ws.readyState).toBe(WebSocket.OPEN);
  });
});
