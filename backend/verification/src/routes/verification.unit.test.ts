import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import axios from "axios";
import { verificationRouter } from "./verification";

vi.mock("axios", async () => {
  const actualAxios = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...actualAxios,
    default: {
      ...actualAxios.defaults,
      get: vi.fn(),
    },
    get: vi.fn(),
  };
});

const mockAxiosGet = vi.mocked(axios.get);

describe("Verification Service", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/verification", verificationRouter);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("POST /api/verification/verify", () => {
    it("should verify an existing credential", async () => {
      const subjectId = "test-credential-123";
      const mockCredential = {
        verified: true,
        credentialId: "test-abc-123",
        type: "Identity Credential",
        issuer: "Kube Credential System",
        subjectId: subjectId,
        issuedAt: "2023-01-01T00:00:00.000Z",
        workerId: "worker-1",
      };

      mockAxiosGet.mockResolvedValueOnce({
        data: mockCredential,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const response = await request(app)
        .post("/api/verification/verify")
        .send({ subjectId })
        .expect(200);

      expect(response.body).toEqual({
        verified: true,
        credentialId: "test-abc-123",
        subjectId: "test-credential-123",
        issuedAt: "2023-01-01T00:00:00.000Z",
        workerId: "worker-1",
        verifiedBy: expect.stringMatching(
          /kube-credential-system-backend-verification/
        ),
        message: expect.stringMatching(/Credential verified by/),
        type: "Identity Credential",
        issuer: "Kube Credential System",
      });

      expect(mockAxiosGet).toHaveBeenCalledWith(
        expect.stringContaining(`/api/issuance/credentials/${subjectId}`)
      );
    });

    it("should return not found for non-existent credential", async () => {
      const subjectId = "non-existent-credential";

      mockAxiosGet.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      });

      const response = await request(app)
        .post("/api/verification/verify")
        .send({ subjectId })
        .expect(404);

      expect(response.body).toEqual({
        verified: false,
        message: "Credential not found",
        verifiedBy: expect.stringMatching(
          /kube-credential-system-backend-verification/
        ),
      });
    });

    it("should validate credential data when provided", async () => {
      const subjectId = "test-credential-123";
      const credentialData = {
        credentialId: "test-abc-123",
        subjectId: subjectId,
        type: "Identity Credential",
        issuer: "Kube Credential System",
      };

      mockAxiosGet.mockResolvedValueOnce({
        data: credentialData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const response = await request(app)
        .post("/api/verification/verify")
        .send({ subjectId, credentialData })
        .expect(200);

      expect(response.body.verified).toBe(true);
    });

    it("should handle issuance service unavailable", async () => {
      const subjectId = "test-credential-123";

      mockAxiosGet.mockRejectedValueOnce(new Error("Network error"));

      const response = await request(app)
        .post("/api/verification/verify")
        .send({ subjectId })
        .expect(503);

      expect(response.body).toEqual({
        error: "Issuance service unavailable",
        verified: false,
      });
    });
  });
});
