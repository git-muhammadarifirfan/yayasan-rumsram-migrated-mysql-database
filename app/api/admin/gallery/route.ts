import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/server/db";
import { requireEditor } from "@/lib/server/auth";
import type { GalleryItem } from "@/lib/types";

export async function GET() {
  try {
    await requireEditor();
    const rows = await query<any[]>(
      "SELECT * FROM gallery_items ORDER BY (sort_order IS NULL), sort_order ASC, created_at DESC"
    );
    const items: GalleryItem[] = (rows || []).map((r: any) => ({
      id: String(r.id),
      title: r.title ?? null,
      category: r.category ?? null,
      image_url: String(r.image_url),
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
    const body = (await req.json()) as { item?: Partial<GalleryItem> };
    const item = body.item || {};
    const id = item.id ? String(item.id) : crypto.randomUUID();
    const image_url = String(item.image_url || "").trim();
    if (!image_url) return NextResponse.json({ error: "image_url wajib" }, { status: 400 });

    const exists = await query<any[]>("SELECT id FROM gallery_items WHERE id = ? LIMIT 1", [id]);
    if (exists?.[0]) {
      await query(
        `UPDATE gallery_items SET title=?, category=?, image_url=?, sort_order=? WHERE id=?`,
        [item.title ?? null, item.category ?? null, image_url, item.sort_order ?? null, id]
      );
    } else {
      await query(
        `INSERT INTO gallery_items (id, title, category, image_url, sort_order, created_at) VALUES (?,?,?,?,?, NOW())`,
        [id, item.title ?? null, item.category ?? null, image_url, item.sort_order ?? null]
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
    await query("DELETE FROM gallery_items WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
