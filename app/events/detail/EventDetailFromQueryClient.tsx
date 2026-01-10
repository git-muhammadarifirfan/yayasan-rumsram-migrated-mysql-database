"use client";

import { PublicShell } from "@/components/PublicShell";
import { SectionReveal } from "@/components/SectionReveal";
import { Markdown } from "@/components/Markdown";
import { Skeleton } from "@/components/Skeleton";
import { SmartImage } from "@/components/SmartImage";
import { getEventBySlug } from "@/lib/apiPublic";
import type { Event } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EventDetailPage() {
  const sp = useSearchParams();
  const slug = sp.get("slug") || "";
  const [item, setItem] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getEventBySlug(slug)
      .then((d) => setItem(d))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <PublicShell>
      <section className="container-xl py-12">
        <SectionReveal>
          <Link href="/events/" className="text-sm font-semibold text-brand-700">
            ← Back to events
          </Link>

          {loading ? (
            <div className="mt-4 grid gap-3">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-6 h-56 w-full rounded-2xl" />
              <Skeleton className="mt-6 h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : item ? (
            <>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">{item.title}</h1>
              <p className="mt-3 text-muted max-w-2xl">{item.excerpt}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {item.event_date ? <span className="badge">{item.event_date}</span> : null}
                {item.location ? <span className="badge">{item.location}</span> : null}
              </div>

              <div className="mt-8">
                <SmartImage src={item.cover_url} alt={item.title} ratio="16/10" className="shadow-soft" />
              </div>

              <div className="mt-8 card p-7">
                <Markdown value={item.content_md} />
              </div>
            </>
          ) : (
            <div className="mt-6 card p-7">
              <h2 className="text-xl font-semibold">Event not found</h2>
              <p className="mt-2 text-sm text-muted">Cek slug atau kembali ke daftar.</p>
            </div>
          )}
        </SectionReveal>
      </section>
    </PublicShell>
  );
}
