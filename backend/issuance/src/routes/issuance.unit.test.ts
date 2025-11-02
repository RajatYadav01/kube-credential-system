import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
  Mock,
} from "vitest";
import request from "supertest";
import express from "express";
import { issuanceRouter } from "./issuance";

interface MockDatabase {
  run: Mock;
  get: Mock;
  all: Mock;
  close: Mock;
}

vi.mock("../services/database-connection", () => {
  const mockDb: MockDatabase = {
    run: vi.fn(),
    get: vi.fn(),
    all: vi.fn(),
    close: vi.fn(),
  };

  return {
    initDB: vi.fn(),
    getDB: vi.fn(() => mockDb),
  };
});

describe("Issuance Service", () => {
  let app: express.Application;
  let mockDb: MockDatabase;

  beforeAll(async () => {
    const { getDB } = await import("../services/database-connection.js");
    mockDb = getDB() as unknown as MockDatabase;
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/issuance", issuanceRouter);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("POST /api/issuance/issue", () => {
    const testCredential = {
      type: "Identity Credential",
      issuer: "Kube Credential System",
      subjectId: "user123",
      claims: {
        name: "John Doe",
        email: "john@example.com",
      },
    };

    it("should issue a new credential successfully", async () => {
      mockDb.get.mockImplementation(
        (
          query: string,
          params: any[],
          callback: (err: Error | null, row: any) => void
        ) => {
          callback(null, null);
        }
      );

      mockDb.run.mockImplementation(function (
        this: { lastID?: number },
        query: string,
        params: any[],
        callback?: (err: Error | null) => void
      ) {
        if (callback) callback(null);
        this.lastID = 1;
      });

      const response = await request(app)
        .post("/api/issuance/issue")
        .send(testCredential)
        .expect(201);

      expect(response.body).toMatchObject({
        message: "Credential issued successfully",
        credentialId: expect.any(String),
        issuedAt: expect.any(String),
        workerId: expect.any(String),
      });

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM credentials WHERE subject_id = ?",
        [expect.any(String)],
        expect.any(Function)
      );
    });

    it("should reject duplicate credentials", async () => {
      const credentialWithId = {
        ...testCredential,
        credential_id: "test-id-123",
      };

      mockDb.get.mockImplementation(
        (
          query: string,
          params: any[],
          callback: (err: Error | null, row: any) => void
        ) => {
          callback(null, {
            credential_id: "test-id-123",
            subject_id: "user123",
            credential_data: JSON.stringify(credentialWithId),
            issued_at: "2023-01-01T00:00:00.000Z",
            worker_id: "worker-1",
          });
        }
      );

      const response = await request(app)
        .post("/api/issuance/issue")
        .send(credentialWithId)
        .expect(409);

      expect(response.body).toEqual({
        message: "Credential already issued",
        credentialId: "test-id-123",
        subjectId: "user123",
        issuedAt: "2023-01-01T00:00:00.000Z",
        workerId: "worker-1",
      });
    });

    it("should validate required fields", async () => {
      const invalidCredential = {
        type: "Identity Credential",
      };

      const response = await request(app)
        .post("/api/issuance/issue")
        .send(invalidCredential)
        .expect(400);

      expect(response.body).toEqual({
        error: "Missing required fields: type, issuer, subject",
      });
    });

    it("should handle database errors during credential check", async () => {
      mockDb.get.mockImplementation(
        (
          query: string,
          params: any[],
          callback: (err: Error | null, row: any) => void
        ) => {
          callback(new Error("Database connection failed"), null);
        }
      );

      const response = await request(app)
        .post("/api/issuance/issue")
        .send(testCredential)
        .expect(500);

      expect(response.body).toEqual({
        error: "Database error",
      });
    });

    it("should handle database errors during credential insertion", async () => {
      mockDb.get.mockImplementation(
        (
          query: string,
          params: any[],
          callback: (err: Error | null, row: any) => void
        ) => {
          callback(null, null);
        }
      );

      mockDb.run.mockImplementation(function (
        query: string,
        params: any[],
        callback: (err: Error | null) => void
      ) {
        if (callback) callback(new Error("Insert failed"));
      });

      const response = await request(app)
        .post("/api/issuance/issue")
        .send(testCredential)
        .expect(500);

      expect(response.body).toEqual({
        error: "Failed to issue credential",
      });
    });
  });

  describe("GET /api/issuance/credentials", () => {
    it("should return all credentials", async () => {
      const mockCredentials = [
        {
          credential_id: "cred-1",
          credential_data: JSON.stringify({
            type: "Identity Credential",
            issuer: "Test System",
          }),
          subject_id: "user1",
          issued_at: "2023-01-01T00:00:00.000Z",
          worker_id: "worker-1",
        },
        {
          credential_id: "cred-2",
          credential_data: JSON.stringify({
            type: "AccessCredential",
            issuer: "Test System",
          }),
          subject_id: "user2",
          issued_at: "2023-01-02T00:00:00.000Z",
          worker_id: "worker-2",
        },
      ];

      mockDb.all.mockImplementation(
        (query: string, callback: (err: Error | null, rows: any[]) => void) => {
          callback(null, mockCredentials);
        }
      );

      const response = await request(app)
        .get("/api/issuance/credentials")
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        credentialId: "cred-1",
        type: "Identity Credential",
        issuer: "Test System",
        subjectId: "user1",
        issuedAt: "2023-01-01T00:00:00.000Z",
        workerId: "worker-1",
      });
    });

    it("should handle database errors when fetching credentials", async () => {
      mockDb.all.mockImplementation(
        (query: string, callback: (err: Error | null, rows: any[]) => void) => {
          callback(new Error("Database error"), []);
        }
      );

      const response = await request(app)
        .get("/api/issuance/credentials")
        .expect(500);

      expect(response.body).toEqual({
        error: "Database error",
      });
    });
  });
});
