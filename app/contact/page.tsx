"use client";

import { PublicShell } from "@/components/PublicShell";
import { SectionReveal } from "@/components/SectionReveal";
import { Skeleton } from "@/components/Skeleton";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { ExternalLink, Mail, MapPin, Phone, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function mapsEmbedSrc(address?: string | null) {
  const q = (address || "").replace(/\n/g, " ").trim();
  const query = q ? encodeURIComponent(q) : encodeURIComponent("Indonesia");
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

function mapsLink(address?: string | null) {
  const q = (address || "").replace(/\n/g, " ").trim();
  if (!q) return "https://www.google.com/maps";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

type ModalState =
  | { open: false }
  | { open: true; kind: "success" | "error"; title: string; desc?: string };

export default function ContactPage() {
  const { settings } = useSiteSettings();

  const email = settings?.email ? String(settings.email).trim() : null;
  const phone = settings?.phone ? String(settings.phone).trim() : "";
  const address = settings?.address ? String(settings.address).trim() : "";

  const embedSrc = useMemo(() => mapsEmbedSrc(address), [address]);
  const mapsHref = useMemo(() => mapsLink(address), [address]);

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [modal, setModal] = useState<ModalState>({ open: false });

  function closeModal() {
    setModal({ open: false });
  }

  useEffect(() => {
    if (!modal.open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal.open]);

 async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const form = e.currentTarget; // <-- simpan dulu
  setStatus("sending");

  const fd = new FormData(form);
  const payload = {
    name: String(fd.get("name") || ""),
    email: String(fd.get("email") || ""),
    message: String(fd.get("message") || ""),
    website: String(fd.get("website") || ""),
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Gagal mengirim pesan.");

    setStatus("sent");
    form.reset(); // <-- pakai ini, bukan e.currentTarget.reset()

    setModal({
      open: true,
      kind: "success",
      title: "Pesan terkirim",
      desc: "Terima kasih! Tim kami akan menindaklanjuti secepatnya.",
    });
  } catch (err: any) {
    setStatus("error");
    setModal({
      open: true,
      kind: "error",
      title: "Gagal mengirim",
      desc: err?.message || "Coba lagi beberapa saat ya.",
    });
  }
}


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
                      <a
                        className="mt-1 inline-block font-semibold text-brand-700 hover:underline"
                        href={`mailto:${email}`}
                      >
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
                        "bg-white/70 backdrop-blur-[2px]"
                    )}
                    aria-label="Open location in Google Maps"
                    title="Open location in Google Maps"
                  >
                    <div className="aspect-[16/10] w-full">
                      <iframe
                        title="Google Maps"
                        src={embedSrc}
                        className="h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>

                    <div
                      className={cx(
                        "pointer-events-none absolute left-3 top-3",
                        "rounded-xl bg-white/80 backdrop-blur-[2px] px-3 py-1.5 text-xs font-semibold",
                        "border border-black/10 shadow-sm",
                        "opacity-0 transition group-hover:opacity-100"
                      )}
                    >
                      Click to open Google Maps
                    </div>
                  </a>

                  <div className="text-xs text-muted">*Peta di atas bisa di-klik untuk membuka Google Maps.</div>
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
              Gunakan form ini untuk menanyakan program yayasan, pengajuan bantuan, atau informasi kegiatan. Tim kami
              akan menindaklanjuti secepatnya.
            </p>

            <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
              {/* honeypot anti-bot (hidden) */}
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />

              <input
                className={cx(
                  "rounded-2xl border border-black/10 bg-white/75 backdrop-blur-[2px] px-4 py-3 text-sm",
                  "outline-none focus:border-brand-600/40 focus:ring-4 focus:ring-brand-600/10"
                )}
                placeholder="Your name"
                name="name"
                autoComplete="name"
                required
              />
              <input
                className={cx(
                  "rounded-2xl border border-black/10 bg-white/75 backdrop-blur-[2px] px-4 py-3 text-sm",
                  "outline-none focus:border-brand-600/40 focus:ring-4 focus:ring-brand-600/10"
                )}
                placeholder="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
              <textarea
                className={cx(
                  "rounded-2xl border border-black/10 bg-white/75 backdrop-blur-[2px] px-4 py-3 text-sm min-h-[120px]",
                  "outline-none focus:border-brand-600/40 focus:ring-4 focus:ring-brand-600/10"
                )}
                placeholder="Message"
                name="message"
                required
              />

              <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending..." : "Send"}
              </button>
            </form>
          </SectionReveal>
        </div>
      </section>

      {/* MODAL NOTIF */}
      {modal.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            onClick={closeModal}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close modal"
          />

          {/* Panel */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-3xl border border-black/10 bg-white/80 backdrop-blur-[2px] p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 transition-colors hover:bg-brand-100/70"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className={cx(
                "inline-flex items-center rounded-2xl border px-3 py-1 text-xs font-semibold",
                modal.kind === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              )}
            >
              {modal.kind === "success" ? "Success" : "Error"}
            </div>

            <div className="mt-3 text-lg font-semibold">{modal.title}</div>
            {modal.desc ? <div className="mt-2 text-sm text-muted">{modal.desc}</div> : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className={cx(
                  "rounded-2xl px-4 py-2 text-sm font-semibold",
                  "border border-black/10 transition-colors hover:bg-brand-100/70"
                )}
              >
                Oke
              </button>
            </div>
          </div>
        </div>
      )}
    </PublicShell>
  );
}
