import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { app } from "./server";

vi.mock("../services/database-connection", () => ({
  initDB: vi.fn(),
  getDB: vi.fn(() => ({
    run: vi.fn(),
    get: vi.fn(),
    all: vi.fn(),
    close: vi.fn(),
  })),
}));

describe("Verification Server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return healthy status from health check", async () => {
    const response = await request(app).get("/api/verification/health").expect(200);

    expect(response.body).toMatchObject({
      status: "healthy",
      service: "verification-service",
      worker: expect.any(String),
    });
  });

  it("should handle 404 for unknown routes", async () => {
    const response = await request(app).get("/unknown-route").expect(404);
  });
});
