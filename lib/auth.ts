import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs";
import { getUserByEmail, getUserById } from "@/lib/dataStore";
import type { Role } from "@/lib/prismaEnums";

const SESSION_COOKIE_NAME = "standup_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const SESSION_ROTATION_INTERVAL_MS = 1000 * 60 * 60 * 24; // 24 hours

const rawSessionSecret = process.env.SESSION_SECRET;
if (process.env.NODE_ENV === "production" && !rawSessionSecret) {
  throw new Error("SESSION_SECRET is required in production");
}

const SESSION_SECRET = rawSessionSecret ?? "development-secret";

interface SessionPayload {
  userId: string;
  role: Role;
  expiresAt: number;
  issuedAt?: number;
}

export interface Session {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: Role;
  };
}

function encodePayload(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

function decodePayload(token: string): SessionPayload | null {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;
  const expected = createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }
  const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;
  if (payload.expiresAt < Date.now()) {
    return null;
  }
  return payload;
}

function issuePayload(userId: string, role: Role): SessionPayload {
  const issuedAt = Date.now();
  return {
    userId,
    role,
    issuedAt,
    expiresAt: issuedAt + SESSION_TTL_MS
  };
}

function setSessionCookie(payload: SessionPayload) {
  const token = encodePayload(payload);
  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(payload.expiresAt),
    path: "/"
  });
}

export async function auth(): Promise<Session | null> {
  const cookie = cookies().get(SESSION_COOKIE_NAME);
  if (!cookie) {
    return null;
  }
  const payload = decodePayload(cookie.value);
  if (!payload) {
    cookies().delete(SESSION_COOKIE_NAME);
    return null;
  }
  const user = await getUserById(payload.userId);
  if (!user) {
    cookies().delete(SESSION_COOKIE_NAME);
    return null;
  }

  const issuedAt = payload.issuedAt ?? payload.expiresAt - SESSION_TTL_MS;
  if (Date.now() - issuedAt > SESSION_ROTATION_INTERVAL_MS) {
    const refreshed = issuePayload(user.id, user.role);
    setSessionCookie(refreshed);
  }
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      role: user.role
    }
  };
}

interface SignInOptions {
  email: string;
  password: string;
  redirectTo?: string;
}

export async function signIn(options: SignInOptions): Promise<void> {
  const user = await getUserByEmail(options.email);
  if (!user || !user.hashedPassword) {
    throw new Error("Invalid credentials");
  }
  const valid = await compare(options.password, user.hashedPassword);
  if (!valid) {
    throw new Error("Invalid credentials");
  }
  const payload = issuePayload(user.id, user.role);
  setSessionCookie(payload);
  if (options.redirectTo) {
    redirect(options.redirectTo);
  }
}

export async function signOut(): Promise<void> {
  cookies().delete(SESSION_COOKIE_NAME);
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}
