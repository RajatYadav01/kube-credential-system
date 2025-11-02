import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { issuanceRouter } from "./routes/issuance";
import { initDB } from "./services/database-connection";

dotenv.config({ path: [".env", ".env.example"] });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: [process.env.FRONTEND_HOST_URL || "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

initDB();

app.use("/api/issuance", issuanceRouter);

app.listen(PORT, () => {
  console.log(`Issuance service running on port ${PORT}`);
});

export { app };
