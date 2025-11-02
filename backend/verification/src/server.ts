import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { verificationRouter } from "./routes/verification";

dotenv.config({ path: [".env", ".env.example"] });

const app = express();
const PORT = process.env.PORT || 3002;

app.use(
  cors({
    origin: [process.env.FRONTEND_HOST_URL || "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/verification", verificationRouter);

app.listen(PORT, () => {
  console.log(`Verification service running on port ${PORT}`);
});

export { app };
