import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/server/db";
import { setSessionCookie, signSession } from "@/lib/server/auth";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) {
      return NextResponse.json({ error: "Email & password wajib" }, { status: 400 });
    }

    const rows = await query<any[]>(
      "SELECT id, name, email, role, password_hash FROM admins WHERE email = ? LIMIT 1",
      [email]
    );
    const u = rows?.[0];
    if (!u) return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });

    const ok = await bcrypt.compare(password, String(u.password_hash || ""));
    if (!ok) return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });

    const token = await signSession({
      id: String(u.id),
      name: u.name ?? null,
      email: String(u.email),
      role: u.role,
    });
    setSessionCookie(token);

    return NextResponse.json({
      session: {
        user: { id: String(u.id), email: String(u.email), name: u.name ?? null },
        role: u.role,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Login failed" }, { status: 500 });
  }
}