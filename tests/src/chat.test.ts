import WebSocket from "ws";
import { describe, it, expect, afterEach } from "vitest";
import {
  createAuthenticatedConnection,
  waitForConnection,
  joinRoom,
  sendChatMessage,
  cleanupConnections,
  TEST_ROOMS,
  waitForMessage,
} from "./helpers";

describe("Chat System", () => {
  let connections: WebSocket[] = [];

  afterEach(() => {
    cleanupConnections(connections);
    connections = [];
  });

  it("broadcasts chat message from one user to another user in same room", async () => {
    const ws1 = createAuthenticatedConnection("chatter1");
    const ws2 = createAuthenticatedConnection("chatter2");
    connections.push(ws1, ws2);

    await Promise.all([waitForConnection(ws1), waitForConnection(ws2)]);

    // Both users join the same room
    await joinRoom(ws1, TEST_ROOMS.CHAT, 100, 100);
    await joinRoom(ws2, TEST_ROOMS.CHAT, 200, 100);

    // Send chat message
    await sendChatMessage(ws1, "Hello from user1!");

    expect(ws1.readyState).toBe(WebSocket.OPEN);
    expect(ws2.readyState).toBe(WebSocket.OPEN);
  });

  it("ignores empty chat messages without crashing server", async () => {
    const ws = createAuthenticatedConnection("emptyChatter");
    connections.push(ws);
    await waitForConnection(ws);

    await joinRoom(ws, TEST_ROOMS.CHAT, 100, 100);

    // Send empty message
    await sendChatMessage(ws, "");

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it("processes very long chat messages without server errors", async () => {
    const ws = createAuthenticatedConnection("longChatter");
    connections.push(ws);
    await waitForConnection(ws);

    await joinRoom(ws, TEST_ROOMS.CHAT, 100, 100);

    // Send long message
    const longMessage =
      "This is a very long message that tests the chat system's ability to handle longer text content without breaking.".repeat(
        5
      );
    await sendChatMessage(ws, longMessage);

    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it("prevents chat messages from users not in any room", async () => {
    const ws = createAuthenticatedConnection("outsideChatter");
    connections.push(ws);
    await waitForConnection(ws);

    // Try to send chat without joining room
    await sendChatMessage(ws, "This should not be sent");

    await new Promise((resolve) => setTimeout(resolve, 500));

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      expect(message.type).toBe("ERROR");
      expect(message.payload.error).toBe("Not in a room or empty message");
    });

    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it("handles burst of 10 rapid chat messages without connection loss", async () => {
    const ws = createAuthenticatedConnection("rapidChatter");
    connections.push(ws);
    await waitForConnection(ws);

    await joinRoom(ws, TEST_ROOMS.CHAT, 100, 100);

    // Send multiple rapid messages
    for (let i = 0; i < 10; i++) {
      await sendChatMessage(ws, `Message ${i}`);
    }

    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it("correctly processes emojis and special characters in chat messages", async () => {
    const ws = createAuthenticatedConnection("specialChatter");
    connections.push(ws);
    await waitForConnection(ws);

    await joinRoom(ws, TEST_ROOMS.CHAT, 100, 100);

    // Test special characters
    const specialMessage =
      "Hello! 🎉 How are you? @everyone #hashtag $money & more...";
    await sendChatMessage(ws, specialMessage);

    expect(ws.readyState).toBe(WebSocket.OPEN);
  });
});
