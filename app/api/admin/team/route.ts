import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/server/db";
import { requireEditor } from "@/lib/server/auth";
import type { TeamMember } from "@/lib/types";

export async function GET() {
  try {
    await requireEditor();
    const rows = await query<any[]>(
      "SELECT * FROM team_members ORDER BY (sort_order IS NULL), sort_order ASC, created_at DESC"
    );
    const items: TeamMember[] = (rows || []).map((r: any) => ({
      id: String(r.id),
      name: String(r.name),
      role_title: r.role_title ?? null,
      bio: r.bio ?? null,
      photo_url: r.photo_url ?? null,
      sort_order: r.sort_order == null ? null : Number(r.sort_order),
      created_at: new Date(r.created_at).toISOString(),
    })) as any;
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireEditor();
    const body = (await req.json()) as { item?: Partial<TeamMember> };
    const item = body.item || {};

    const id = item.id ? String(item.id) : crypto.randomUUID();
    const name = String(item.name || "").trim();
    if (!name) return NextResponse.json({ error: "Name wajib" }, { status: 400 });

    const exists = await query<any[]>("SELECT id FROM team_members WHERE id = ? LIMIT 1", [id]);
    if (exists?.[0]) {
      await query(
        `UPDATE team_members SET name=?, role_title=?, bio=?, photo_url=?, sort_order=? WHERE id=?`,
        [name, item.role_title ?? null, item.bio ?? null, item.photo_url ?? null, item.sort_order ?? null, id]
      );
    } else {
      await query(
        `INSERT INTO team_members (id, name, role_title, bio, photo_url, sort_order, created_at)
         VALUES (?,?,?,?,?,?, NOW())`,
        [id, name, item.role_title ?? null, item.bio ?? null, item.photo_url ?? null, item.sort_order ?? null]
      );
    }

    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireEditor();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await query("DELETE FROM team_members WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
