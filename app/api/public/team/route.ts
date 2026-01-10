import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import type { TeamMember } from "@/lib/types";

export async function GET() {
  try {
    const rows = await query<any[]>(
      "SELECT * FROM team_members ORDER BY (sort_order IS NULL), sort_order ASC, created_at DESC"
    );
    const items: TeamMember[] = (rows || []).map((r: any) => ({
      id: String(r.id),
      name: String(r.name),
      role_title: r.role_title ?? null,
      bio: r.bio ?? null,
      photo_url: r.photo_url ?? null,
      sort_order: r.sort_order == null ? null : Number(r.sort_order),
      created_at: new Date(r.created_at).toISOString(),
    })) as any;
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
