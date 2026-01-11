"use client";

import { PublicShell } from "@/components/PublicShell";
import { SectionReveal } from "@/components/SectionReveal";
import { Skeleton } from "@/components/Skeleton";
import { SmartImage } from "@/components/SmartImage";
import { listPrograms } from "@/lib/apiPublic";
import type { Program } from "@/lib/types";
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

export default function ProgramsPage() {
  const [items, setItems] = useState<Program[] | null>(null);

  useEffect(() => {
    listPrograms().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <PublicShell>
      <section className="container-xl py-12">
        <SectionReveal>
          <div className="badge">Programs</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Program unggulan</h1>
          <p className="mt-3 text-muted max-w-2xl">
            Rangkaian program terbaik Yayasan Rumsram untuk menghadirkan dampak nyata bagi masyarakat.
          </p>
        </SectionReveal>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items ? (
            items.map((p) => (
              <Link
                key={p.id}
                href={`/programs/detail/?slug=${encodeURIComponent(p.slug)}`}
                className="card p-4 hover:shadow-soft transition"
              >
                <SmartImage src={p.cover_url} alt={p.title} ratio="16/10" />
                <div className="mt-4 text-lg font-semibold">{p.title}</div>
                <div className="mt-2 text-sm text-muted line-clamp-3">{p.excerpt}</div>
                <div className="mt-4 text-sm font-semibold text-brand-700">Read more</div>
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
