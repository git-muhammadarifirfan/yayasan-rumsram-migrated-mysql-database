"use client";

import { PublicShell } from "@/components/PublicShell";
import { SectionReveal } from "@/components/SectionReveal";
import { Skeleton } from "@/components/Skeleton";
import { SmartImage } from "@/components/SmartImage";
import { CenterModal } from "@/components/CenterModal";
import { listGalleryMixed } from "@/lib/apiPublic";
import type { GalleryUnifiedItem } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import Link from "next/link";

type LightboxItem = {
  id: string;
  title?: string | null;
  image_url: string;
  category?: string | null;
  href?: string | null;
};

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryUnifiedItem[] | null>(null);

  // Filter kategori
  const [activeCat, setActiveCat] = useState<string>("All");

  // Modal state: null = closed, number = active index
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    listGalleryMixed()
      .then(setItems)
      .catch((e) => {
        console.error(e);
        setItems([]);
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (items ?? []).forEach((i) => set.add(i.category || "Gallery"));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return null;
    if (activeCat === "All") return items;
    return items.filter((i) => (i.category || "Gallery") === activeCat);
  }, [items, activeCat]);

  const lightboxItems = useMemo(() => {
    return (filtered ?? []).map((i) => ({
      id: String(i.id),
      title: i.title ?? null,
      image_url: i.image_url,
      category: i.category ?? null,
      href: i.href ?? null,
    })) as LightboxItem[];
  }, [filtered]);

  const open = activeIndex !== null;
  const active = activeIndex !== null ? lightboxItems[activeIndex] : null;

  function openModal(index: number) {
    setActiveIndex(index);
  }

  function closeModal() {
    setActiveIndex(null);
  }

  function prev() {
    if (!lightboxItems.length || activeIndex === null) return;
    setActiveIndex((i) => {
      if (i === null) return 0;
      return (i - 1 + lightboxItems.length) % lightboxItems.length;
    });
  }

  function next() {
    if (!lightboxItems.length || activeIndex === null) return;
    setActiveIndex((i) => {
      if (i === null) return 0;
      return (i + 1) % lightboxItems.length;
    });
  }

  // Lock scroll + keyboard controls (ESC, arrow)
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex, lightboxItems.length]);

  // If filter changes & index becomes invalid -> close
  useEffect(() => {
    if (activeIndex === null) return;
    if (activeIndex >= lightboxItems.length) setActiveIndex(null);
  }, [activeIndex, lightboxItems.length]);

  return (
    <PublicShell>
      <SectionReveal>
        <div className="container-xl py-10 md:py-14">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Gallery
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted">
                Foto dokumentasi dari Program, Event, Blog, serta unggahan gallery.
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                className={cx(
                  "badge transition",
                  c === activeCat
                    ? "border-brand-600 text-brand-700"
                    : "hover:bg-black/5"
                )}
                onClick={() => setActiveCat(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="mt-6">
            {!filtered ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="card overflow-hidden">
                    <div className="aspect-[16/12]">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <div className="p-4">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="mt-2 h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="card p-8">
                <div className="text-base font-semibold">Belum ada foto</div>
                <p className="mt-2 text-sm text-muted">
                  Konten gallery akan muncul setelah ada unggahan.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((it, idx) => (
                  <div key={String(it.id)} className="card overflow-hidden">
                    <button
                      className="group relative block w-full text-left"
                      onClick={() => openModal(idx)}
                      aria-label="Open image"
                    >
                      <div className="relative aspect-[16/12] overflow-hidden bg-black/5">
                        <SmartImage
                          src={it.image_url}
                          alt={it.title || "Gallery item"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    </button>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {it.title || "Untitled"}
                          </div>
                          <div className="mt-1 text-xs text-muted">
                            {it.category || "Gallery"}
                          </div>
                        </div>

                        {it.href ? (
                          <Link
                            href={it.href}
                            className="btn btn-ghost px-3 py-2 text-xs"
                            title="Buka sumber"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Center Modal */}
          <CenterModal open={open && !!active} onClose={closeModal}>
            {active ? (
              <div
                className={cx(
                  "card overflow-hidden",
                  "bg-background/95 border-white/10 shadow-soft"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {active.title || "Untitled"}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      {active.category || "Gallery"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {active.href ? (
                      <Link
                        href={active.href}
                        className="btn btn-ghost px-3 py-2 text-xs"
                        title="Buka sumber"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="hidden sm:inline">Sumber</span>
                      </Link>
                    ) : null}

                    <button
                      className="btn btn-ghost px-3 py-2"
                      onClick={closeModal}
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div className="relative bg-black/5">
                  {/* container height: smooth + not too big */}
                  <div className="relative h-[55vh] max-h-[520px] min-h-[260px] w-full">
                    <SmartImage
                      src={active.image_url}
                      alt={active.title || "Preview"}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Prev / Next */}
                  {lightboxItems.length > 1 ? (
                    <>
                      <button
                        className={cx(
                          "absolute left-2 top-1/2 -translate-y-1/2",
                          "btn btn-ghost bg-white/70 hover:bg-white/85 backdrop-blur",
                          "rounded-2xl px-3 py-2"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          prev();
                        }}
                        aria-label="Previous"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <button
                        className={cx(
                          "absolute right-2 top-1/2 -translate-y-1/2",
                          "btn btn-ghost bg-white/70 hover:bg-white/85 backdrop-blur",
                          "rounded-2xl px-3 py-2"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          next();
                        }}
                        aria-label="Next"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  ) : null}
                </div>

                {/* Footer small hint */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-muted">
                  <div>
                    {lightboxItems.length > 1
                      ? "← → untuk navigasi, ESC untuk tutup"
                      : "ESC untuk tutup"}
                  </div>
                  {activeIndex !== null && lightboxItems.length > 0 ? (
                    <div>
                      {activeIndex + 1}/{lightboxItems.length}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </CenterModal>
        </div>
      </SectionReveal>
    </PublicShell>
  );
}
