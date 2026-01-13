import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

type JwtPayload = {
  sub: string; // userId
  email: string;
};

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "7d";

if (!JWT_ACCESS_SECRET) {
  throw new Error("Missing env: JWT_ACCESS_SECRET");
}

export async function hashPassword(password: string): Promise<string> {
  // bcrypt cost 12 is good balance for MVP
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET as string, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_ACCESS_SECRET as string);
  // jsonwebtoken returns string | object; ensure object
  if (typeof decoded === "string" || !decoded) {
    throw new Error("Invalid token payload");
  }
  const obj = decoded as jwt.JwtPayload;
  const sub = obj.sub;
  const email = obj.email;

  if (!sub || typeof sub !== "string" || !email || typeof email !== "string") {
    throw new Error("Invalid token payload");
  }

  return { sub, email };
}

/**
 * Extract bearer token from Authorization header:
 * Authorization: Bearer <token>
 */
export function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}
