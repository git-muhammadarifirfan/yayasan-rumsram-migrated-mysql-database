"use client";

import { PublicShell } from "@/components/PublicShell";
import { SectionReveal } from "@/components/SectionReveal";
import { Skeleton } from "@/components/Skeleton";
import { SmartImage } from "@/components/SmartImage";
import { listPosts } from "@/lib/apiPublic";
import type { Post } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MessageSquareText, User } from "lucide-react";

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function fmtDate(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "2-digit" });
}

function MetaPill({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  const base =
    "inline-flex shrink-0 items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] leading-none text-muted shadow-[0_1px_0_rgba(0,0,0,0.04)]";
  if (href) {
    return (
      <a
        href={href}
        className={cx(
          base,
          "transition hover:border-black/20 hover:text-black focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </a>
    );
  }
  return <span className={base}>{children}</span>;
}

function MetaRowInlineOneLine({ post }: { post: Post }) {
  // 1 line, kalau kepanjangan: scroll horizontal
  return (
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {post.published_at ? (
        <MetaPill>
          <CalendarDays className="h-3.5 w-3.5" />
          {fmtDate(post.published_at)}
        </MetaPill>
      ) : null}

      {post.author_email ? (
        <MetaPill>
          <User className="h-3.5 w-3.5" />
          <span className="max-w-[220px] truncate">{post.author_email}</span>
        </MetaPill>
      ) : null}

      {typeof post.comment_count === "number" ? (
        <MetaPill>
          <MessageSquareText className="h-3.5 w-3.5" />
          {post.comment_count}
        </MetaPill>
      ) : null}
    </div>
  );
}

function BlogCard({ post }: { post: Post }) {
  const href = `/blog/detail?slug=${encodeURIComponent(post.slug)}`;

  const title = post.title ?? "Artikel";

  return (
    <article
      className={cx(
        "group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-card",
        "transition hover:-translate-y-0.5 hover:shadow-lg"
      )}
    >
      {/* ✅ FIX MERAH: image benar-benar “gabung” dengan card (rounded ikut) */}
      <Link
        href={href}
        className="relative block aspect-[16/10] overflow-hidden rounded-none rounded-t-3xl bg-black/5"
      >
        {post.cover_url ? (
          <>
            {/* paksa nempel full (no gap) */}
            <SmartImage
              src={post.cover_url}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </>
        ) : (
          <div className="absolute inset-0" />
        )}
      </Link>

      <div className="p-5">
        {/* ✅ FIX BIRU: 1 line sejajar */}
        <MetaRowInlineOneLine post={post} />

        <Link href={href} className="mt-3 block">
          <div className="line-clamp-2 text-base font-semibold leading-snug text-black transition group-hover:opacity-90">
            {title}
          </div>
        </Link>

        {post.excerpt ? (
          <div className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</div>
        ) : null}

        <div className="mt-5">
          <Link
            href={href}
            className={cx(
              "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white",
              "px-4 py-2 text-sm font-semibold text-brand-700",
              "shadow-[0_1px_0_rgba(0,0,0,0.04)] transition",
              "hover:border-black/20 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            )}
          >
            Baca selengkapnya <span aria-hidden></span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function BlogPage() {
  const [items, setItems] = useState<Post[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    listPosts()
      .then(setItems)
      .catch((e) => {
        console.error(e);
        setItems([]);
      });
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!items) return null;
    if (!qq) return items;
    return items.filter((p) => {
      const hay = `${p.title ?? ""} ${(p.excerpt ?? "")}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [items, q]);

  return (
    <PublicShell>
      <SectionReveal>
        <div className="container-xl py-10 md:py-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Blog</h1>
              <p className="mt-3 max-w-2xl text-sm text-muted">
                Artikel terbaru, cerita kegiatan, dan informasi dari Yayasan Rumsram.
              </p>
            </div>

            <div className="w-full md:w-[360px]">
              <label className="sr-only">Search</label>
              <input
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                placeholder="Cari judul atau ringkasan…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8">
            {!filtered ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-card"
                  >
                    <div className="aspect-[16/10]">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Skeleton className="h-5 w-24 rounded-full" />
                        <Skeleton className="h-5 w-40 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                      <Skeleton className="mt-4 h-5 w-4/5" />
                      <div className="mt-3 grid gap-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                      <div className="mt-5">
                        <Skeleton className="h-9 w-40 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-card">
                <div className="text-base font-semibold">Belum ada artikel</div>
                <p className="mt-2 text-sm text-muted">Coba ubah kata kunci pencarian atau cek lagi nanti.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionReveal>
    </PublicShell>
  );
}
