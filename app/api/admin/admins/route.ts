import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { query } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export async function GET() {
  try {
    await requireAdmin();
    const rows = await query<any[]>(
      "SELECT id, name, email, role, created_at FROM admins ORDER BY created_at DESC"
    );
    const items = (rows || []).map((r: any) => ({
      id: String(r.id),
      name: r.name ?? null,
      email: String(r.email),
      role: String(r.role),
      created_at: new Date(r.created_at).toISOString(),
    }));
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = (await req.json()) as { name?: string; email?: string; password?: string; role?: string };
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = (body.role === "editor" ? "editor" : "admin") as any;

    if (!name || name.length > 120) return NextResponse.json({ error: "Nama tidak valid" }, { status: 400 });
    if (!email || email.length > 160) return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });

    const exists = await query<any[]>("SELECT id FROM admins WHERE email = ? LIMIT 1", [email]);
    if (exists?.[0]) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });

    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    await query(
      "INSERT INTO admins (id, name, email, password_hash, role, created_at, updated_at) VALUES (?,?,?,?,?, NOW(), NOW())",
      [id, name, email, hash, role]
    );

    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
