import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import type { Event } from "@/lib/types";

export async function GET() {
  try {
    const rows = await query<any[]>(
      "SELECT * FROM events WHERE status = 'published' ORDER BY (event_date IS NULL), event_date ASC, created_at DESC"
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
