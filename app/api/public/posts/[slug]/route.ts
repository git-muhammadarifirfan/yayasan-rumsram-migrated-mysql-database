import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import type { Post } from "@/lib/types";

function maskEmail(email?: string | null) {
  const e = (email || "").trim();
  if (!e) return null;
  const at = e.indexOf("@");
  if (at <= 1) return null;
  const name = e.slice(0, at);
  const domain = e.slice(at + 1);
  const masked = name[0] + "***" + (name.length > 2 ? name.slice(-1) : "");
  return `${masked}@${domain}`;
}


export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    // Next.js 15+ may type `params` as a Promise in route handlers.
    const { slug: rawSlug } = await (params as any);
    const slug = decodeURIComponent(rawSlug || "");
    const rows = await query<any[]>(`SELECT p.*, (
          SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id
       ) AS comment_count
       FROM posts p
       WHERE p.slug = ? AND p.status = 'published'
       LIMIT 1`, [slug]
    );
    const r = rows?.[0];
    if (!r) return NextResponse.json({ item: null });
    const item: Post = {
      id: String(r.id),
      title: String(r.title),
      slug: String(r.slug),
      excerpt: r.excerpt ?? null,
      content_md: r.content_md ?? null,
      cover_url: r.cover_url ?? null,
      status: r.status,
      published_at: r.published_at ? new Date(r.published_at).toISOString().slice(0, 10) : null,
      created_at: new Date(r.created_at).toISOString(),
      updated_at: new Date(r.updated_at).toISOString(),
      category: r.category ?? null,
      author_id: r.author_id ?? null,
      author_email: maskEmail(r.author_email) ?? null,
      comment_count: Number(r.comment_count || 0),
    } as any;
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}