import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL not set - Postgres will not be used");
}

export const pgPool = connectionString
  ? new Pool({ connectionString, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false })
  : null;

export async function query(text: string, params?: any[]) {
  if (!pgPool) throw new Error("Postgres pool not initialized. Set DATABASE_URL in .env");
  const res = await pgPool.query(text, params);
  return res;
}
