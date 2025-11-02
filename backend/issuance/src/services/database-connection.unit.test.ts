import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Database } from "sqlite3";
import { initDB, getDB } from "./database-connection";

vi.mock("sqlite3", () => {
  const mockDatabase = vi.fn();
  mockDatabase.prototype.run = vi.fn();
  mockDatabase.prototype.get = vi.fn();
  mockDatabase.prototype.all = vi.fn();
  mockDatabase.prototype.close = vi.fn();

  return {
    Database: mockDatabase,
  };
});

describe("Database Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should initialize database with correct schema", () => {
    const mockRun = vi.fn();
    (Database as any).mockImplementation(function (this: { run?: typeof mockRun }) {
      this.run = mockRun;
    });

    initDB();

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS credentials"),
      expect.any(Function)
    );
  });

  it("should handle database initialization errors", () => {
    const mockRun = vi.fn((query, callback) => {
      callback(new Error("Init failed"));
    });

    (Database as any).mockImplementation(function (this: { run?: typeof mockRun }) {
      this.run = mockRun;
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    initDB();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error creating table:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should return database instance", () => {
    const dbInstance = getDB();
    expect(dbInstance).toBeInstanceOf(Database);
  });
});
