// src/lib/auth.ts
import jwt, { type Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type JwtPayload = {
  sub: string; // userId
  email: string;
};

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_ACCESS_EXPIRES_IN_RAW = process.env.JWT_ACCESS_EXPIRES_IN ?? "7d";

if (!JWT_ACCESS_SECRET) {
  throw new Error("Missing env: JWT_ACCESS_SECRET");
}

const JWT_SECRET: Secret = JWT_ACCESS_SECRET;

const JWT_EXPIRES_IN: jwt.SignOptions["expiresIn"] =
  JWT_ACCESS_EXPIRES_IN_RAW as jwt.SignOptions["expiresIn"];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === "string" || !decoded) {
    throw new Error("Invalid token payload");
  }

  const obj = decoded as jwt.JwtPayload;
  const sub = obj.sub;

  let email: unknown = undefined;
  if (isObject(decoded)) {
    email = decoded["email"];
  }

  if (!sub || typeof sub !== "string" || typeof email !== "string") {
    throw new Error("Invalid token payload");
  }

  return { sub, email };
}

export function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;

  return token;
}

/**
 * Returns user row (id,email,name...) or null.
 * Does NOT throw.
 */
export async function getUserFromRequest(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) return null;

  let payload: JwtPayload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  // extra guard: token email must match db email
  if (user.email !== payload.email) return null;

  return user;
}

/**
 * Must be used in all protected routes.
 * Throws Error("UNAUTHORIZED") when invalid.
 */
export async function requireUser(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
