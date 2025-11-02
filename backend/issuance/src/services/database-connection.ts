import { Database } from "sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(process.cwd(), "data", "issuance.db");

export const initDB = () => {
  const db = new Database(dbPath);

  db.run(
    `
    CREATE TABLE IF NOT EXISTS credentials (
      credential_id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      credential_data TEXT NOT NULL,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      worker_id TEXT NOT NULL
    )
  `,
    (err: unknown) => {
      if (err) {
        console.error("Error creating table:", err);
      } else {
        console.log("Credentials table initialized");
      }
    }
  );

  return db;
};

export const getDB = () => {
  return new Database(dbPath);
};
