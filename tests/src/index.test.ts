// Main test file that imports all other test modules
// This ensures all tests are run when running the test suite

// Import all test modules
import "./auth.test";
import "./room.test";
import "./movement.test";
import "./chat.test";
import "./error-handling.test";
import "./connection.test";
import "./performance.test";

import { describe, it, expect } from "vitest";
import { SERVER_URL } from "./helpers";

describe("Integration Tests", () => {
  it("should have valid server configuration", () => {
    expect(SERVER_URL).toBeDefined();
  });
});
