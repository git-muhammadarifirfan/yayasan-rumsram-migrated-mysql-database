"use client";

import { PublicShell } from "@/components/PublicShell";
import { SectionReveal } from "@/components/SectionReveal";
import { Skeleton } from "@/components/Skeleton";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { useMemo } from "react";

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function mapsEmbedSrc(address?: string | null) {
  // Embed without API key (simple). Uses "q" query.
  const q = (address || "").replace(/\n/g, " ").trim();
  const query = q ? encodeURIComponent(q) : encodeURIComponent("Indonesia");
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

function mapsLink(address?: string | null) {
  const q = (address || "").replace(/\n/g, " ").trim();
  if (!q) return "https://www.google.com/maps";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export default function ContactPage() {
  // Settings dibaca dari cache hook (1x fetch untuk seluruh app)
  const { settings } = useSiteSettings();

  const email = settings?.email ? String(settings.email).trim() : null;
  const phone = settings?.phone ? String(settings.phone).trim() : "";
  const address = settings?.address ? String(settings.address).trim() : "";

  const embedSrc = useMemo(() => mapsEmbedSrc(address), [address]);
  const mapsHref = useMemo(() => mapsLink(address), [address]);

  return (
    <PublicShell>
      <section className="container-xl py-12">
        <SectionReveal>
          <div className="badge">Contact</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Get in touch</h1>
          <p className="mt-3 text-muted max-w-2xl">
            Silakan hubungi kami untuk kolaborasi, program, atau dukungan.
          </p>
        </SectionReveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* LEFT */}
          <SectionReveal className="card p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Contact info</h2>

              {/* Open in Google Maps */}
              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                className={cx(
                  "inline-flex items-center gap-1.5 text-sm font-semibold",
                  "text-brand-700 hover:underline"
                )}
              >
                Open maps <ExternalLink className="h-4 w-4 opacity-70" />
              </a>
            </div>

            {settings ? (
              <div className="mt-4 grid gap-4 text-sm">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <MapPin className="h-4 w-4" />
                    Address
                  </div>
                  <div className="font-semibold whitespace-pre-line">{address || "-"}</div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 p-4">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Phone className="h-4 w-4" />
                      Phone
                    </div>
                    {phone ? (
                      <a className="mt-1 inline-block font-semibold hover:underline" href={`tel:${phone}`}>
                        {phone}
                      </a>
                    ) : (
                      <div className="mt-1 font-semibold">-</div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-black/10 p-4">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    {email ? (
                      <a className="mt-1 inline-block font-semibold text-brand-700 hover:underline" href={`mailto:${email}`}>
                        {email}
                      </a>
                    ) : (
                      <div className="mt-1 font-semibold">-</div>
                    )}
                  </div>
                </div>

                {/* Embedded map (clickable) */}
                <div className="mt-2 grid gap-2">
                  <div className="text-xs text-muted">Location</div>
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className={cx(
                      "group relative block overflow-hidden rounded-2xl border border-black/10",
                      "bg-white"
                    )}
                    aria-label="Open location in Google Maps"
                    title="Open location in Google Maps"
                  >
                    {/* 16:10 ratio */}
                    <div className="aspect-[16/10] w-full">
                      <iframe
                        title="Google Maps"
                        src={embedSrc}
                        className="h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>

                    {/* small overlay hint */}
                    <div
                      className={cx(
                        "pointer-events-none absolute left-3 top-3",
                        "rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold",
                        "border border-black/10 shadow-sm",
                        "opacity-0 transition group-hover:opacity-100"
                      )}
                    >
                      Click to open Google Maps
                    </div>
                  </a>

                  <div className="text-xs text-muted">
                    *Peta di atas bisa di-klik untuk membuka Google Maps.
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            )}
          </SectionReveal>

          {/* RIGHT */}
          <SectionReveal className="card p-7">
            <h2 className="text-xl font-semibold">Message</h2>
            <p className="mt-2 text-sm text-muted">
              Gunakan form ini untuk menanyakan program yayasan, pengajuan bantuan, atau informasi kegiatan. Tim kami akan menindaklanjuti secepatnya.
            </p>

            <form
              className="mt-4 grid gap-3"
              action={`mailto:${email || ""}`}
              method="post"
              encType="text/plain"
            >
              <input
                className={cx(
                  "rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm",
                  "outline-none focus:border-brand-600/40 focus:ring-4 focus:ring-brand-600/10"
                )}
                placeholder="Your name"
                name="name"
                autoComplete="name"
              />
              <input
                className={cx(
                  "rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm",
                  "outline-none focus:border-brand-600/40 focus:ring-4 focus:ring-brand-600/10"
                )}
                placeholder="Email"
                name="email"
                type="email"
                autoComplete="email"
              />
              <textarea
                className={cx(
                  "rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm min-h-[120px]",
                  "outline-none focus:border-brand-600/40 focus:ring-4 focus:ring-brand-600/10"
                )}
                placeholder="Message"
                name="message"
              />
              <button className="btn btn-primary" type="submit">
                Send
              </button>
            </form>
          </SectionReveal>
        </div>
      </section>
    </PublicShell>
  );
}
