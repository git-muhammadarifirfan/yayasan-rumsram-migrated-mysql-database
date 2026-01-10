"use client";

import { PublicShell } from "@/components/PublicShell";
import { SectionReveal } from "@/components/SectionReveal";
import { useSiteSettings } from "@/lib/useSiteSettings";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
// NOTE: tidak perlu fetch settings per-page (sudah dicache oleh useSiteSettings)

export default function DonatePage() {
  const { settings } = useSiteSettings();

  return (
    <PublicShell>
      <section className="container-xl py-12">
        <SectionReveal className="card p-8">
          <div className="badge">Donate</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Support our mission</h1>
          <p className="mt-3 text-muted max-w-2xl">
            Donasi membantu program literasi, air bersih, ekonomi mikro, dan penguatan masyarakat adat.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={settings?.donation_link || "https://rumsram.or.id/"} className="btn btn-primary">
              Open donation link <ArrowRight size={16} />
            </Link>
            <Link href="/contact/" className="btn btn-ghost">
              Contact us
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="card p-5">
              <div className="text-sm font-semibold">Fast impact</div>
              <div className="mt-2 text-sm text-muted">Bantu pembiayaan program prioritas.</div>
            </div>
            <div className="card p-5">
              <div className="text-sm font-semibold">Transparent</div>
              <div className="mt-2 text-sm text-muted">Konten & update dikelola lewat CMS.</div>
            </div>
            <div className="card p-5">
              <div className="text-sm font-semibold">Community-first</div>
              <div className="mt-2 text-sm text-muted">Fokus pada kebutuhan kampung/adat.</div>
            </div>
          </div>
        </SectionReveal>
      </section>
    </PublicShell>
  );
}
