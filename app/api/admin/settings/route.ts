import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { requireEditor } from "@/lib/server/auth";

const ALLOWED = new Set([
  "org_name",
  "tagline",
  "hero_title",
  "hero_subtitle",
  "donation_cta_label",
  "donation_link",
  "about_short",
  "about_long",
  "vision",
  "mission_items",
  "values_items",
  "address",
  "phone",
  "email",
  "social",
  "logo_url",
  "hero_image_url",
]);

export async function PATCH(req: Request) {
  try {
    await requireEditor();

    const body = (await req.json()) as { patch?: Record<string, any> };
    const patch = body.patch || {};

    const keys = Object.keys(patch).filter((k) => ALLOWED.has(k));
    if (keys.length === 0) return NextResponse.json({ ok: true });

    const setParts: string[] = [];
    const params: any[] = [];

    for (const k of keys) {
      let v = patch[k];
      if (k === "mission_items" || k === "values_items" || k === "social") {
        v = v == null ? null : JSON.stringify(v);
      }
      setParts.push(`${k} = ?`);
      params.push(v);
    }

    setParts.push("updated_at = NOW()");

    await query(
      `UPDATE site_settings SET ${setParts.join(", ")} WHERE id = 1`,
      params
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
