import type { Role } from "./types";
import { fetchJson } from "./http";

export type Session = {
  user: { id: string; email: string; name?: string | null };
  role: Role;
};

export async function getSession(): Promise<Session | null> {
  try {
    const data = await fetchJson<{ session: Session | null }>("/api/auth/me", { method: "GET" });
    return data.session;
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string) {
  const data = await fetchJson<{ session: Session }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.session;
}

export async function signOut() {
  await fetchJson("/api/auth/logout", { method: "POST", body: JSON.stringify({}) });
}

export async function getMyRole(): Promise<Role> {
  const s = await getSession();
  return s?.role ?? "viewer";
}

export function isAdmin(role: Role) {
  return role === "admin";
}

export function canEdit(role: Role) {
  return role === "admin" || role === "editor";
}
