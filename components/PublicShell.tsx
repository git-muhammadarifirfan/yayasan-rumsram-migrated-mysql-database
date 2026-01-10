"use client";

import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { FloatingBlobs } from "./FloatingBlobs";
import { useSiteSettings } from "@/lib/useSiteSettings";

export function PublicShell({ children }: { children: React.ReactNode }) {
  // Settings dipakai untuk navbar/footer (logo, nama organisasi, CTA donate, dll).
  // Menggunakan hook dengan cache agar tidak fetch ulang tiap page.
  const { settings } = useSiteSettings();

  return (
    <div className="min-h-screen gradient-bg relative">
      <FloatingBlobs />
      <NavBar
        donateHref={settings?.donation_link || "/donate/"}
        donateLabel={settings?.donation_cta_label ?? null}
        logoUrl={settings?.logo_url || null}
        orgName={settings?.org_name ?? null}
      />
      <main className="relative">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
