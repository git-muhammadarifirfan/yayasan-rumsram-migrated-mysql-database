import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import type { GalleryItem } from "@/lib/types";

export async function GET() {
  try {
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
