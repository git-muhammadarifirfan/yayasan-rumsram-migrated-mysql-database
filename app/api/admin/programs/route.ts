import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/server/db";
import { parseJson } from "@/lib/server/json";
import { requireEditor } from "@/lib/server/auth";
import type { Program } from "@/lib/types";

export async function GET() {
  try {
    await requireEditor();
    const rows = await query<any[]>(
      "SELECT * FROM programs ORDER BY (sort_order IS NULL), sort_order ASC, created_at DESC"
    );
    const items: Program[] = (rows || []).map((r: any) => ({
      id: String(r.id),
      title: String(r.title),
      slug: String(r.slug),
      excerpt: r.excerpt ?? null,
      content_md: r.content_md ?? null,
      cover_url: r.cover_url ?? null,
      gallery_urls: parseJson<string[] | null>(r.gallery_urls, null),
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
    const body = (await req.json()) as { item?: Partial<Program> };
    const item = body.item || {};
    const id = item.id ? String(item.id) : crypto.randomUUID();
    const title = String(item.title || "").trim();
    const slug = String(item.slug || "").trim();
    if (!title || !slug) return NextResponse.json({ error: "Title & slug wajib" }, { status: 400 });

    const status = (item.status as any) || "draft";
    const gallery_urls = item.gallery_urls == null ? null : JSON.stringify(item.gallery_urls);

    // upsert by id
    const exists = await query<any[]>("SELECT id FROM programs WHERE id = ? LIMIT 1", [id]);
    if (exists?.[0]) {
      await query(
        `UPDATE programs SET title=?, slug=?, excerpt=?, content_md=?, cover_url=?, gallery_urls=?, status=?, sort_order=?, updated_at=NOW() WHERE id=?`,
        [
          title,
          slug,
          item.excerpt ?? null,
          item.content_md ?? null,
          item.cover_url ?? null,
          gallery_urls,
          status,
          item.sort_order ?? null,
          id,
        ]
      );
    } else {
      await query(
        `INSERT INTO programs (id, title, slug, excerpt, content_md, cover_url, gallery_urls, status, sort_order, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?, NOW(), NOW())`,
        [
          id,
          title,
          slug,
          item.excerpt ?? null,
          item.content_md ?? null,
          item.cover_url ?? null,
          gallery_urls,
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
    await query("DELETE FROM programs WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
