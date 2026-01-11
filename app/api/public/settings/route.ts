import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { parseJson } from "@/lib/server/json";
import type { SiteSettings } from "@/lib/types";

export async function GET() {
  try {
    const rows = await query<any[]>("SELECT * FROM site_settings WHERE id = 1 LIMIT 1");
    const r = rows?.[0];
    if (!r) return NextResponse.json({ settings: null });

    const settings: SiteSettings = {
      id: Number(r.id),
      org_name: String(r.org_name),
      tagline: r.tagline ?? null,
      hero_title: r.hero_title ?? null,
      hero_subtitle: r.hero_subtitle ?? null,
      donation_cta_label: r.donation_cta_label ?? null,
      donation_link: r.donation_link ?? null,
      about_short: r.about_short ?? null,
      about_long: r.about_long ?? null,
      vision: r.vision ?? null,
      mission_items: parseJson<string[] | null>(r.mission_items, null),
      values_items: parseJson<string[] | null>(r.values_items, null),
      address: r.address ?? null,
      phone: r.phone ?? null,
      email: r.email ?? null,
      social: parseJson<any | null>(r.social, null),
      logo_url: r.logo_url ?? null,
      hero_image_url: r.hero_image_url ?? null,
    } as any;

    return NextResponse.json({ settings });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
