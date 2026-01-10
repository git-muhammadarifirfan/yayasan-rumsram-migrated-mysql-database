import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { query } from "./db";
import type { Role } from "../types";

const COOKIE_NAME = "rumsram_session";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("Missing env: AUTH_SECRET");
  return new TextEncoder().encode(s);
}

export type AuthedUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
};

export async function signSession(u: AuthedUser) {
  const token = await new SignJWT({ email: u.email, role: u.role, name: u.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(u.id)
    .setIssuedAt()
    .setExpirationTime(process.env.AUTH_TTL || "7d")
    .sign(secret());

  return token;
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret());
  const id = String(payload.sub || "");
  const email = String(payload.email || "");
  const role = (payload.role as Role) || "viewer";
  const name = (payload.name as any) ?? null;
  return { id, email, role, name } as AuthedUser;
}

export async function getUserFromRequest(): Promise<AuthedUser | null> {
  const c = cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const u = await verifySessionToken(token);
    // ensure user still exists
    const rows = await query<any[]>("SELECT id, name, email, role FROM admins WHERE id = ? LIMIT 1", [u.id]);
    const row = rows?.[0];
    if (!row) return null;
    return {
      id: String(row.id),
      name: row.name ?? null,
      email: String(row.email),
      role: (row.role as Role) ?? "viewer",
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  const c = cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function clearSessionCookie() {
  const c = cookies();
  c.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function requireAuth() {
  const u = await getUserFromRequest();
  if (!u) throw new Error("Not authenticated");
  return u;
}

export async function requireEditor() {
  const u = await requireAuth();
  if (!(u.role === "admin" || u.role === "editor")) throw new Error("Forbidden");
  return u;
}

export async function requireAdmin() {
  const u = await requireAuth();
  if (u.role !== "admin") throw new Error("Forbidden");
  return u;
}
