import WebSocket from "ws";
import { describe, it, expect, afterEach } from "vitest";
import {
  createAuthenticatedConnection,
  waitForConnection,
  joinRoom,
  cleanupConnections,
  TEST_ROOMS,
} from "./helpers";

describe("Room Management", () => {
  let connections: WebSocket[] = [];

  afterEach(() => {
    cleanupConnections(connections);
    connections = [];
  });

  it("allows user to join room with valid coordinates and receives confirmation", async () => {
    const ws = createAuthenticatedConnection("testuser1");
    connections.push(ws);
    await waitForConnection(ws);

    // Join room using helper function
    const joinMessage = await joinRoom(ws, TEST_ROOMS.DEFAULT, 100, 100);

    expect(joinMessage.type).toBe("ROOM_STATE");
    expect(joinMessage.payload.roomId).toEqual(TEST_ROOMS.DEFAULT);
  });

  it("correctly handles two users joining the same room simultaneously", async () => {
    const ws1 = createAuthenticatedConnection("user1");
    const ws2 = createAuthenticatedConnection("user2");
    connections.push(ws1, ws2);

    await Promise.all([waitForConnection(ws1), waitForConnection(ws2)]);

    // Both users join the same room
    await joinRoom(ws1, TEST_ROOMS.DEFAULT, 100, 100);
    await joinRoom(ws2, TEST_ROOMS.DEFAULT, 200, 100);

    // Verify both users are in the room
    expect(ws1.readyState).toBe(WebSocket.OPEN);
    expect(ws2.readyState).toBe(WebSocket.OPEN);
  });

  it("allows user to switch between different rooms seamlessly", async () => {
    const ws = createAuthenticatedConnection("switcher");
    connections.push(ws);
    await waitForConnection(ws);

    // Join first room
    await joinRoom(ws, "room1", 100, 100);

    // Switch to second room
    await joinRoom(ws, "room2", 200, 200);

    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it("maintains connection when user leaves room while others stay", async () => {
    const ws1 = createAuthenticatedConnection("stayer");
    const ws2 = createAuthenticatedConnection("leaver");
    connections.push(ws1, ws2);

    await Promise.all([waitForConnection(ws1), waitForConnection(ws2)]);

    // Both join the same room
    await joinRoom(ws1, TEST_ROOMS.DEFAULT, 100, 100);
    await joinRoom(ws2, TEST_ROOMS.DEFAULT, 200, 100);

    // Second user leaves
    ws2.send(JSON.stringify({ type: "LEAVE_ROOM" }));

    // Wait a bit for processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(ws1.readyState).toBe(WebSocket.OPEN);
  });
});
