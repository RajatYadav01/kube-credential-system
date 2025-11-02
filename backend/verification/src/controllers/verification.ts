import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: [".env", ".env.example"] });

interface Credential {
  credentialId?: string;
  type: string;
  issuer: string;
  subjectId: string;
  claims: Record<string, any>;
  issuedAt?: string;
  workerId?: string;
}

interface VerificationRequest {
  subjectId: string;
}

export const healthCheck = (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "verification-service",
    worker:
      process.env.WORKER_ID ||
      `kube-credential-system-backend-verification-${process.pid}`,
  });
};

export const verifyCredential = async (req: Request, res: Response) => {
  try {
    const { subjectId }: VerificationRequest = req.body;

    if (!subjectId) {
      return res.status(400).json({
        error: "Subject ID is required",
      });
    }

    const workerId =
      process.env.WORKER_ID ||
      `kube-credential-system-backend-verification-${process.pid}`;

    try {
      const issuanceApiUrl = process.env.ISSUANCE_API_URL;
      const response = await axios.get(
        `${issuanceApiUrl}/api/issuance/credentials/${subjectId}`
      );

      const credential = response.data as Credential;

      res.json({
        verified: true,
        credentialId: credential.credentialId,
        type: credential.type,
        issuer: credential.issuer,
        subjectId: credential.subjectId,
        claims: credential.claims,
        issuedAt: credential.issuedAt,
        workerId: credential.workerId,
        verifiedBy: workerId,
        message: `Credential verified by ${workerId}`,
      });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return res.status(404).json({
          verified: false,
          message: "Credential not found",
          verifiedBy: workerId,
        });
      }

      console.error("Error calling issuance service:", error);
      return res.status(503).json({
        error: "Issuance service unavailable",
        verified: false,
      });
    }
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
