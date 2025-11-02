import { Request, Response } from "express";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { getDB } from "../services/database-connection";

dotenv.config({ path: [".env", ".env.example"] });

interface Credential {
  credentialId?: string;
  type: string;
  issuer: string;
  subjectId: string;
  claims: Record<string, any>;
  issuedAt?: string;
}

export const healthCheck = (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "issuance-service",
    worker:
      process.env.WORKER_ID ||
      `kube-credential-system-backend-issuance-${process.pid}`,
  });
};

export const issueCredential = (req: Request, res: Response) => {
  try {
    const credential: Credential = req.body;

    if (!credential.type || !credential.issuer || !credential.subjectId) {
      return res.status(400).json({
        error: "Missing required fields: type, issuer, subject",
      });
    }

    const credentialId = credential.credentialId || uuidv4();
    const workerId =
      process.env.WORKER_ID ||
      `kube-credential-system-backend-issuance-${process.pid}`;

    const db = getDB();

    db.get(
      "SELECT * FROM credentials WHERE subject_id = ?",
      [credential.subjectId],
      (err: unknown, row: any) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        if (row) {
          return res.status(409).json({
            message: "Credential already issued",
            credentialId: row.credential_id,
            subjectId: row.subject_id,
            issuedAt: row.issued_at,
            workerId: row.worker_id,
          });
        }

        db.run(
          "INSERT INTO credentials (credential_id, subject_id, credential_data, worker_id) VALUES (?, ?, ?, ?)",
          [
            credentialId,
            credential.subjectId,
            JSON.stringify(credential),
            workerId,
          ],
          function (err: unknown) {
            if (err) {
              return res
                .status(500)
                .json({ error: "Failed to issue credential" });
            }

            res.status(201).json({
              message: "Credential issued successfully",
              credentialId,
              subjectId: credential.subjectId,
              issuedAt: new Date().toISOString(),
              workerId,
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCredentialById = (req: Request, res: Response) => {
  try {
    const subjectId = req.params.id;

    const db = getDB();

    db.get(
      "SELECT * FROM credentials WHERE subject_id = ?",
      [subjectId],
      (err: unknown, row: any) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        if (!row) {
          return res.status(404).json({ error: "Credential not found" });
        }

        res.json({
          credentialId: row.credential_id,
          subjectId: row.subject_id,
          ...JSON.parse(row.credential_data),
          issuedAt: row.issued_at,
          workerId: row.worker_id,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCredentials = (_req: Request, res: Response) => {
  const db = getDB();

  db.all(
    "SELECT * FROM credentials ORDER BY issued_at DESC",
    (err: unknown, rows: any[]) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      res.json(
        rows.map((row: any) => ({
          credentialId: row.credential_id,
          subjectId: row.subject_id,
          ...JSON.parse(row.credential_data),
          issuedAt: row.issued_at,
          workerId: row.worker_id,
        }))
      );
    }
  );
};
