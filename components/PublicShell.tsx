"use client";

import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { FloatingBlobs } from "./FloatingBlobs";
import { useSiteSettings } from "@/lib/useSiteSettings";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const { settings } = useSiteSettings();

  return (
    <div className="min-h-screen gradient-bg relative">
      <FloatingBlobs />
      <NavBar
        donateHref={settings?.donation_link ?? "/donate/"}
        donateLabel={settings?.donation_cta_label ?? undefined}
        logoUrl={settings?.logo_url ?? undefined}
        orgName={settings?.org_name ?? undefined}
      />
      <main className="relative">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
