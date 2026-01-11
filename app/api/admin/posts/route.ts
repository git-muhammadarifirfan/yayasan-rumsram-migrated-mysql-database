import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/server/db";
import { requireEditor } from "@/lib/server/auth";
import type { Post } from "@/lib/types";

function toDateOrNull(v: any) {
  if (!v) return null;
  const s = String(v).slice(0, 10);
  return s;
}

export async function GET() {
  try {
    await requireEditor();
    const rows = await query<any[]>(`SELECT p.*, (
          SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id
       ) AS comment_count
       FROM posts p
       ORDER BY (published_at IS NULL), published_at DESC, created_at DESC`);
    const items: Post[] = (rows || []).map((r: any) => ({
      id: String(r.id),
      title: String(r.title),
      slug: String(r.slug),
      excerpt: r.excerpt ?? null,
      content_md: r.content_md ?? null,
      cover_url: r.cover_url ?? null,
      status: r.status,
      published_at: r.published_at ? String(r.published_at).slice(0, 10) : null,
      created_at: new Date(r.created_at).toISOString(),
      updated_at: new Date(r.updated_at).toISOString(),
      category: r.category ?? null,
      author_id: r.author_id ?? null,
      author_email: r.author_email ?? null,
      comment_count: Number(r.comment_count || 0),
    })) as any;
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const u = await requireEditor();
    const body = (await req.json()) as { item?: Partial<Post> };
    const item = body.item || {};
    const id = item.id ? String(item.id) : crypto.randomUUID();
    const title = String(item.title || "").trim();
    const slug = String(item.slug || "").trim();
    if (!title || !slug) return NextResponse.json({ error: "Title & slug wajib" }, { status: 400 });

    const status = (item.status as any) || "draft";
    const published_at = toDateOrNull(item.published_at);
    const exists = await query<any[]>("SELECT id FROM posts WHERE id = ? LIMIT 1", [id]);

    if (exists?.[0]) {
      await query(
        `UPDATE posts SET title=?, slug=?, excerpt=?, content_md=?, cover_url=?, status=?, published_at=?, category=?, author_id=?, author_email=?, updated_at=NOW() WHERE id=?`,
        [
          title,
          slug,
          item.excerpt ?? null,
          item.content_md ?? null,
          item.cover_url ?? null,
          status,
          published_at,
          item.category ?? null,
          u.id,
          u.email,
          id,
        ]
      );
    } else {
      await query(
        `INSERT INTO posts (id, title, slug, excerpt, content_md, cover_url, status, published_at, category, author_id, author_email, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?, NOW(), NOW())`,
        [
          id,
          title,
          slug,
          item.excerpt ?? null,
          item.content_md ?? null,
          item.cover_url ?? null,
          status,
          published_at,
          item.category ?? null,
          u.id,
          u.email,
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
    await query("DELETE FROM posts WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
