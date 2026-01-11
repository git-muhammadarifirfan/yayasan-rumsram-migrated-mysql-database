import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import type { PostComment } from "@/lib/types";
import crypto from "crypto";

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


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    if (!postId) return NextResponse.json({ items: [] });
    const rows = await query<any[]>(
      "SELECT id, post_id, author_name, author_email, content, created_at FROM post_comments WHERE post_id = ? ORDER BY created_at DESC",
      [postId]
    );
    const items: PostComment[] = (rows || []).map((r: any) => ({
      id: String(r.id),
      post_id: String(r.post_id),
      author_name: String(r.author_name),
      author_email: maskEmail(r.author_email) ?? null,
      content: String(r.content),
      created_at: new Date(r.created_at).toISOString(),
    })) as any;
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      post_id?: string;
      author_name?: string;
      author_email?: string | null;
      content?: string;
    };
    const post_id = String(body.post_id || "");
    const author_name = String(body.author_name || "").trim();
    const author_email = body.author_email ? String(body.author_email).trim() : null;
    const content = String(body.content || "").trim();

    if (!post_id) return NextResponse.json({ error: "post_id wajib" }, { status: 400 });
    if (!author_name || author_name.length > 80) return NextResponse.json({ error: "Nama tidak valid" }, { status: 400 });
    if (!content || content.length > 2000) return NextResponse.json({ error: "Komentar tidak valid" }, { status: 400 });
    if (author_email && author_email.length > 160) return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });

    // only allow comments on published posts
    const p = await query<any[]>("SELECT id FROM posts WHERE id = ? AND status = 'published' LIMIT 1", [post_id]);
    if (!p?.[0]) return NextResponse.json({ error: "Post tidak ditemukan" }, { status: 404 });

    const id = crypto.randomUUID();
    await query(
      "INSERT INTO post_comments (id, post_id, author_name, author_email, content, created_at) VALUES (?,?,?,?,?, NOW())",
      [id, post_id, author_name, author_email, content]
    );
    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}