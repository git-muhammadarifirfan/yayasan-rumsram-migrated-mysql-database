import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { parseJson } from "@/lib/server/json";
import type { Program } from "@/lib/types";

export async function GET() {
  try {
    const rows = await query<any[]>(
      "SELECT * FROM programs WHERE status = 'published' ORDER BY (sort_order IS NULL), sort_order ASC, created_at DESC"
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
