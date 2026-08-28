import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response } from "express";
import { pool } from "./db.js";

const scrypt = promisify(scryptCallback);
const sessionDays = 30;
const sessionCookie = "muscle_recovery_session";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, salt, expected] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !expected) return false;
  const actual = await scrypt(password, salt, 64) as Buffer;
  const expectedBuffer = Buffer.from(expected, "base64url");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

function sessionTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

function readCookie(req: Request, name: string): string | undefined {
  const pair = req.headers.cookie?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : undefined;
}

function writeSessionCookie(res: Response, token: string): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.append("Set-Cookie", `${sessionCookie}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionDays * 86400}${secure}`);
}

export function clearSessionCookie(res: Response): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.append("Set-Cookie", `${sessionCookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

export async function createSession(res: Response, userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  await pool.query("insert into auth_sessions (token_hash, user_id, expires_at) values ($1, $2, now() + interval '30 days')", [sessionTokenHash(token), userId]);
  writeSessionCookie(res, token);
}

export async function currentUserId(req: Request): Promise<string | undefined> {
  const token = readCookie(req, sessionCookie);
  if (!token) return undefined;
  const result = await pool.query<{ user_id: string }>("select user_id from auth_sessions where token_hash = $1 and expires_at > now()", [sessionTokenHash(token)]);
  return result.rows[0]?.user_id;
}

export async function requireUser(req: Request, res: Response): Promise<string | undefined> {
  const userId = await currentUserId(req);
  if (!userId) res.status(401).json({ error: "Authentication is required." });
  return userId;
}

export async function deleteCurrentSession(req: Request): Promise<void> {
  const token = readCookie(req, sessionCookie);
  if (token) await pool.query("delete from auth_sessions where token_hash = $1", [sessionTokenHash(token)]);
}
