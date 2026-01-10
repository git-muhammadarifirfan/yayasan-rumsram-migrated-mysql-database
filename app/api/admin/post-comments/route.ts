import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { requireEditor } from "@/lib/server/auth";

export async function GET(req: Request) {
  try {
    await requireEditor();
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    if (!postId) return NextResponse.json({ items: [] });
    const rows = await query<any[]>(
      "SELECT id, post_id, author_name, author_email, content, created_at FROM post_comments WHERE post_id=? ORDER BY created_at DESC",
      [postId]
    );
    const items = (rows || []).map((r: any) => ({
      id: String(r.id),
      post_id: String(r.post_id),
      author_name: String(r.author_name),
      author_email: r.author_email ?? null,
      content: String(r.content),
      created_at: new Date(r.created_at).toISOString(),
    }));
    return NextResponse.json({ items });
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
    await query("DELETE FROM post_comments WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
