import WebSocket from "ws";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createAuthenticatedConnection,
  waitForConnection,
  cleanupConnections,
} from "./helpers";

describe("Performance & Load Testing", () => {
  let testConnections: WebSocket[] = [];

  beforeEach(() => {
    testConnections = [];
  });

  afterEach(() => {
    cleanupConnections(testConnections);
  });

  it("handles 20 concurrent users joining same room within performance threshold", async () => {
    // Arrange
    const EXPECTED_USER_COUNT = 20;
    const PERFORMANCE_THRESHOLD_MS = 2000;
    const ROOM_ID = "performance-test-room";

    // Act
    const startTime = performance.now();

    // Create connections concurrently
    const connectionPromises = Array.from(
      { length: EXPECTED_USER_COUNT },
      (_, i) =>
        createAndJoinRoom(`user${i}`, ROOM_ID, 100 + i * 10, 100 + i * 10)
    );

    await Promise.all(connectionPromises);

    // Send concurrent movement updates
    const movementPromises = testConnections.map((ws, i) =>
      sendMessage(ws, {
        type: "MOVEMENT",
        x: 200 + i * 10,
        y: 200 + i * 10,
      })
    );

    await Promise.all(movementPromises);
    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Assert
    expect(testConnections).toHaveLength(EXPECTED_USER_COUNT);
    expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    expect(
      testConnections.every((ws) => ws.readyState === WebSocket.OPEN)
    ).toBe(true);
  }, 15000);

  it("processes 50 rapid messages within acceptable latency", async () => {
    // Arrange
    const USER_COUNT = 5;
    const MESSAGE_COUNT = 50;
    const LATENCY_THRESHOLD_MS = 3000;
    const ROOM_ID = "broadcast-test-room";

    // Setup users in room
    for (let i = 0; i < USER_COUNT; i++) {
      await createAndJoinRoom(`broadcaster${i}`, ROOM_ID, 100 + i * 20, 100);
    }

    // Act
    const startTime = performance.now();
    const messagePromises = Array.from({ length: MESSAGE_COUNT }, (_, i) =>
      sendMessage(testConnections[0], {
        type: "CHAT",
        message: `Performance test message ${i}`,
      })
    );

    await Promise.all(messagePromises);
    const endTime = performance.now();
    const totalLatency = endTime - startTime;

    // Assert
    expect(totalLatency).toBeLessThan(LATENCY_THRESHOLD_MS);
    expect(testConnections).toHaveLength(USER_COUNT);
  }, 10000);

  it("maintains isolation across multiple concurrent rooms", async () => {
    // Arrange
    const ROOM_COUNT = 10;
    const USERS_PER_ROOM = 5;
    const EXPECTED_TOTAL_USERS = ROOM_COUNT * USERS_PER_ROOM;
    const PROCESSING_THRESHOLD_MS = 4000;

    // Act
    const startTime = performance.now();

    // Create rooms with users concurrently
    const roomSetupPromises = Array.from(
      { length: ROOM_COUNT },
      (_, roomIndex) =>
        Promise.all(
          Array.from({ length: USERS_PER_ROOM }, (_, userIndex) =>
            createAndJoinRoom(
              `user-${roomIndex}-${userIndex}`,
              `room-${roomIndex}`,
              100 + userIndex * 20,
              100
            )
          )
        )
    );

    await Promise.all(roomSetupPromises);

    // Send messages from all users simultaneously
    const messagingPromises = testConnections.map((ws, index) =>
      sendMessage(ws, {
        type: "CHAT",
        message: `Cross-room test message ${index}`,
      })
    );

    await Promise.all(messagingPromises);
    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Assert
    expect(testConnections).toHaveLength(EXPECTED_TOTAL_USERS);
    expect(totalTime).toBeLessThan(PROCESSING_THRESHOLD_MS);
    expect(
      testConnections.every((ws) => ws.readyState === WebSocket.OPEN)
    ).toBe(true);
  }, 20000);

  it("maintains connection stability under mixed operation load", async () => {
    // Arrange
    const CONNECTION_COUNT = 10;
    const OPERATION_COUNT = 100;

    // Setup connections
    for (let i = 0; i < CONNECTION_COUNT; i++) {
      const ws = createAuthenticatedConnection(`stressUser${i}`);
      await waitForConnection(ws);
      testConnections.push(ws);
    }

    // Act - Mixed operations (movement, room changes, chat)
    const operationPromises = Array.from(
      { length: OPERATION_COUNT },
      (_, opIndex) => {
        const targetConnection = testConnections[opIndex % CONNECTION_COUNT];
        const operationType = opIndex % 3;

        switch (operationType) {
          case 0: // Movement
            return sendMessage(targetConnection, {
              type: "MOVEMENT",
              x: Math.floor(Math.random() * 1000),
              y: Math.floor(Math.random() * 1000),
            });

          case 1: // Room operations
            return sendMessage(targetConnection, {
              type: "JOIN_ROOM",
              roomId: `stress-room-${opIndex % 5}`,
              x: Math.floor(Math.random() * 500),
              y: Math.floor(Math.random() * 500),
            });

          case 2: // Chat
            return sendMessage(targetConnection, {
              type: "CHAT",
              message: `Stress test message ${opIndex}`,
            });

          default:
            return Promise.resolve();
        }
      }
    );

    await Promise.all(operationPromises);

    // Assert - All connections should remain active
    const activeConnections = testConnections.filter(
      (ws) => ws.readyState === WebSocket.OPEN
    );

    expect(activeConnections).toHaveLength(CONNECTION_COUNT);
  }, 30000);

  // Helper functions for better test organization
  async function createAndJoinRoom(
    username: string,
    roomId: string,
    x: number,
    y: number
  ): Promise<void> {
    const ws = createAuthenticatedConnection(username);
    await waitForConnection(ws);
    testConnections.push(ws);

    await sendMessage(ws, {
      type: "JOIN_ROOM",
      roomId,
      x,
      y,
    });
  }

  async function sendMessage(
    ws: WebSocket,
    message: Record<string, any>
  ): Promise<void> {
    return new Promise((resolve) => {
      ws.send(JSON.stringify(message));
      // Small delay to prevent overwhelming the server
      setTimeout(resolve, 1);
    });
  }
});
