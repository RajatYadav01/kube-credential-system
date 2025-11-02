import { Router } from "express";
import { healthCheck, issueCredential, getCredentialById, getAllCredentials } from "../controllers/issuance";

export const issuanceRouter = Router();

issuanceRouter.get("/health", healthCheck);

issuanceRouter.post("/issue", issueCredential);

issuanceRouter.get("/credentials/:id", getCredentialById);

issuanceRouter.get("/credentials", getAllCredentials);
