"use client";

import { PublicShell } from "@/components/PublicShell";
import { SectionReveal } from "@/components/SectionReveal";
import { Skeleton } from "@/components/Skeleton";
import { SmartImage } from "@/components/SmartImage";
import { listEvents } from "@/lib/apiPublic";
import type { Event } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

function ItemSkeleton() {
  return (
    <div className="card p-4">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="mt-4 h-5 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
    </div>
  );
}

export default function EventsPage() {
  const [items, setItems] = useState<Event[] | null>(null);

  useEffect(() => {
    listEvents().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <PublicShell>
      <section className="container-xl py-12">
        <SectionReveal>
          <div className="badge">Events</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Agenda & kegiatan</h1>
          <p className="mt-3 text-muted max-w-2xl">
            Menyajikan informasi terkini mengenai agenda, kegiatan, dan berbagai acara yang dapat diikuti oleh masyarakat, mitra, maupun pemangku kepentingan lainnya.
          </p>
        </SectionReveal>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items ? (
            items.map((e) => (
              <Link
                key={e.id}
                href={`/events/detail/?slug=${encodeURIComponent(e.slug)}`}
                className="card p-4 hover:shadow-soft transition"
              >
                <SmartImage src={e.cover_url} alt={e.title} ratio="16/10" />
                <div className="mt-4 text-lg font-semibold">{e.title}</div>
                <div className="mt-2 text-sm text-muted line-clamp-2">{e.excerpt}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {e.event_date ? <span className="badge">{e.event_date}</span> : null}
                  {e.location ? <span className="badge">{e.location}</span> : null}
                </div>
              </Link>
            ))
          ) : (
            Array.from({ length: 6 }).map((_, i) => <ItemSkeleton key={i} />)
          )}
        </div>
      </section>
    </PublicShell>
  );
}
