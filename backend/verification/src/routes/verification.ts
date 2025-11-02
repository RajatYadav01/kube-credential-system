import { Router } from "express";
import { healthCheck, verifyCredential } from "../controllers/verification";

export const verificationRouter = Router();

verificationRouter.get("/health", healthCheck);

verificationRouter.post("/verify", verifyCredential);
