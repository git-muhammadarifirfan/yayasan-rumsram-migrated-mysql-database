import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/server/db";
import { requireEditor } from "@/lib/server/auth";
import type { Event } from "@/lib/types";

export async function GET() {
  try {
    await requireEditor();
    const rows = await query<any[]>(
      "SELECT * FROM events ORDER BY (event_date IS NULL), event_date DESC, created_at DESC"
    );
    const items: Event[] = (rows || []).map((r: any) => ({
      id: String(r.id),
      title: String(r.title),
      slug: String(r.slug),
      excerpt: r.excerpt ?? null,
      content_md: r.content_md ?? null,
      event_date: r.event_date ? new Date(r.event_date).toISOString().slice(0, 10) : null,
      location: r.location ?? null,
      cover_url: r.cover_url ?? null,
      status: r.status,
      sort_order: r.sort_order == null ? null : Number(r.sort_order),
      created_at: new Date(r.created_at).toISOString(),
      updated_at: new Date(r.updated_at).toISOString(),
    })) as any;
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireEditor();
    const body = (await req.json()) as { item?: Partial<Event> };
    const item = body.item || {};
    const id = item.id ? String(item.id) : crypto.randomUUID();
    const title = String(item.title || "").trim();
    const slug = String(item.slug || "").trim();
    if (!title || !slug) return NextResponse.json({ error: "Title & slug wajib" }, { status: 400 });

    const status = (item.status as any) || "draft";
    const exists = await query<any[]>("SELECT id FROM events WHERE id = ? LIMIT 1", [id]);
    if (exists?.[0]) {
      await query(
        `UPDATE events SET title=?, slug=?, excerpt=?, content_md=?, event_date=?, location=?, cover_url=?, status=?, sort_order=?, updated_at=NOW() WHERE id=?`,
        [
          title,
          slug,
          item.excerpt ?? null,
          item.content_md ?? null,
          item.event_date ?? null,
          item.location ?? null,
          item.cover_url ?? null,
          status,
          item.sort_order ?? null,
          id,
        ]
      );
    } else {
      await query(
        `INSERT INTO events (id, title, slug, excerpt, content_md, event_date, location, cover_url, status, sort_order, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?, NOW(), NOW())`,
        [
          id,
          title,
          slug,
          item.excerpt ?? null,
          item.content_md ?? null,
          item.event_date ?? null,
          item.location ?? null,
          item.cover_url ?? null,
          status,
          item.sort_order ?? null,
        ]
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
    await query("DELETE FROM events WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
