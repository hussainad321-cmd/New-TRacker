// @ts-nocheck

import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query, pgPool } from "./postgres";
import { logger, AppError } from "./error-handler";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "please-set-a-secret-in-env";
const SALT_ROUNDS = 10;

// Helper to ensure users table exists (Postgres)
export async function ensureUsersTable() {
  if (!pgPool) return;
  const create = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    hashed_password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_login TIMESTAMP WITH TIME ZONE
  );`;
  await pgPool.query(create);
}

router.post("/api/auth/register", async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    // Insert user
    const insert = `INSERT INTO users (email, username, hashed_password) VALUES ($1, $2, $3) RETURNING id, email, username, role, created_at`;
    const result = await query(insert, [email, username || null, hashed]);
    const user = result.rows[0];

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (err: any) {
    logger.error("Registration error", err);
    if (err.code === "23505") {
      // unique violation
      return res.status(400).json({ message: "User already exists" });
    }
    next(err);
  }
});

router.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const getUser = `SELECT id, email, username, hashed_password, role FROM users WHERE email = $1`;
    const result = await query(getUser, [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.hashed_password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    // update last_login
    await query(`UPDATE users SET last_login = now() WHERE id = $1`, [user.id]);

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// Middleware to protect routes
export function authMiddleware(req: any, res: any, next: any) {
  // Allow all requests in development mode without token
  if (process.env.NODE_ENV !== "production") {
    req.user = { id: 1, role: "admin" }; // Mock user for development
    return next();
  }

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
  const token = auth.slice(7);
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export default router;
