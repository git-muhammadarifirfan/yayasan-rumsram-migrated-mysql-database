"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PublicShell } from "@/components/PublicShell";
import { SectionReveal } from "@/components/SectionReveal";
import { SmartImage } from "@/components/SmartImage";
import { Skeleton } from "@/components/Skeleton";
import { listPrograms, listEvents, listPosts } from "@/lib/apiPublic";
import type { Program, Event, Post } from "@/lib/types";
import { useSiteSettings } from "@/lib/useSiteSettings";

function CardSkeleton() {
  return (
    <div className="card p-4">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="mt-4 h-5 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
    </div>
  );
}

export default function HomePage() {
  // Ambil settings dari cache (dipakai juga oleh PublicShell)
  const { settings } = useSiteSettings();
  const [programs, setPrograms] = useState<Program[] | null>(null);
  const [events, setEvents] = useState<Event[] | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    listPrograms().then(setPrograms).catch(() => setPrograms([]));
    listEvents().then(setEvents).catch(() => setEvents([]));
    listPosts().then(setPosts).catch(() => setPosts([]));
  }, []);

  const heroTitle =
    settings?.hero_title || "Loading . . .";
  const heroSubtitle =
    settings?.hero_subtitle ||
    "Loading . . .";

  const ctaLabel = settings?.donation_cta_label || "Dukung Program";
  const ctaLink = settings?.donation_link || "/donate/";

  const mission = useMemo(
    () => (settings?.mission_items || []).filter(Boolean).slice(0, 4),
    [settings]
  );

  return (
    <PublicShell>
      {/* HERO */}
      <section className="relative">
        <div className="container-xl py-14 md:py-20">
          <SectionReveal>
            <div className="max-w-3xl">
              <div className="badge">{settings?.org_name ? settings.org_name : <span className="inline-block align-middle"><Skeleton className="h-4 w-36 rounded-md" /></span>}</div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate md:text-5xl">
                {heroTitle ? heroTitle : (<span className="block"><Skeleton className="h-10 w-10/12 rounded-2xl" /><Skeleton className="mt-3 h-10 w-8/12 rounded-2xl" /></span>)}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-muted md:text-lg">
                {heroSubtitle ? heroSubtitle : (<span className="block"><Skeleton className="h-5 w-full rounded-md" /><Skeleton className="mt-2 h-5 w-10/12 rounded-md" /><Skeleton className="mt-2 h-5 w-8/12 rounded-md" /></span>)}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a className="btn btn-primary" href={ctaLink} target="_blank" rel="noreferrer">
                  {ctaLabel ? ctaLabel : <Skeleton className="h-5 w-28 rounded-md" />}
                </a>
                <Link className="btn btn-ghost" href="/programs/">
                  Lihat Program
                </Link>
                <Link className="btn btn-ghost" href="/contact/">
                  Kontak
                </Link>
              </div>
            </div>
          </SectionReveal>

          <div className="mt-10 grid items-start gap-6 md:grid-cols-2">
            <SectionReveal>
              <SmartImage
                src={settings?.hero_image_url}
                alt="Kegiatan Yayasan"
                ratio="16/11"
                className="shadow-soft"
              />
            </SectionReveal>

            <SectionReveal>
              <div className="card p-6">
                <div className="text-sm font-semibold">Tentang kami</div>
                <p className="mt-2 text-sm text-muted md:text-base">
                  {settings?.about_short ||
                    "Kami berfokus pada program yang terukur, transparan, dan dapat dikelola bersama komunitas."}
                </p>

                {mission.length ? (
                  <div className="mt-5 grid gap-2">
                    {mission.map((m, idx) => (
                      <div key={idx} className="flex gap-2 text-sm">
                        <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-lg bg-black/5 text-xs font-semibold">
                          ✓
                        </span>
                        <span className="text-slate">{m}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-2">
                  <Link className="btn btn-ghost" href="/about/">
                    Profil Yayasan
                  </Link>
                  <Link className="btn btn-ghost" href="/gallery/">
                    Galeri Kegiatan
                  </Link>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="container-xl pb-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="badge">Programs</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Program unggulan
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted md:text-base">
              Berfokus pada penciptaan dampak yang berkelanjutan bagi masyarakat dan lingkungan. Seluruh program dan konten dikelola secara terintegrasi melalui sistem admin untuk memastikan transparansi, efektivitas, dan kemudahan pembaruan.
            </p>
          </div>
          <Link className="btn btn-ghost hidden md:inline-flex" href="/programs/">
            View all
          </Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {programs ? (
            programs.slice(0, 3).map((p) => (
              <Link
                key={p.id}
                href={`/programs/detail/?slug=${encodeURIComponent(p.slug)}`}
                className="card p-4 hover:shadow-soft transition"
              >
                <SmartImage src={p.cover_url} alt={p.title} ratio="16/10" />
                <div className="mt-4 text-lg font-semibold">{p.title}</div>
                <div className="mt-2 text-sm text-muted line-clamp-3">
                  {p.excerpt}
                </div>
                <div className="mt-4 text-sm font-semibold text-brand-700">
                  Read more
                </div>
              </Link>
            ))
          ) : (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          )}
        </div>

        <div className="mt-5 md:hidden">
          <Link className="btn btn-ghost w-full justify-center" href="/programs/">
            View all programs
          </Link>
        </div>
      </section>

      {/* EVENTS */}
      <section className="container-xl pb-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="badge">Events</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Agenda & kegiatan
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted md:text-base">
              Menyajikan informasi terkini mengenai agenda, kegiatan, dan berbagai acara yang dapat diikuti oleh masyarakat, mitra, maupun pemangku kepentingan lainnya.
            </p>
          </div>
          <Link className="btn btn-ghost hidden md:inline-flex" href="/events/">
            View all
          </Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {events ? (
            events.slice(0, 3).map((e) => (
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
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          )}
        </div>

        <div className="mt-5 md:hidden">
          <Link className="btn btn-ghost w-full justify-center" href="/events/">
            View all events
          </Link>
        </div>
      </section>

      {/* BLOG */}
      <section className="container-xl pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="badge">Blog</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Cerita & update
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted md:text-base">
              Berisi rangkuman aktivitas lapangan, laporan program, serta kabar terbaru Yayasan RUMSRAM sebagai bentuk dokumentasi, refleksi, dan pembelajaran bersama.
            </p>
          </div>
          <Link className="btn btn-ghost hidden md:inline-flex" href="/blog/">
            View all
          </Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {posts ? (
            posts.slice(0, 3).map((p) => (
              <Link
                key={p.id}
                href={`/blog/detail/?slug=${encodeURIComponent(p.slug)}`}
                className="card p-4 hover:shadow-soft transition"
              >
                <SmartImage src={p.cover_url} alt={p.title} ratio="16/10" />
                <div className="mt-4 text-lg font-semibold">{p.title}</div>
                <div className="mt-2 text-sm text-muted line-clamp-3">
                  {p.excerpt}
                </div>
              </Link>
            ))
          ) : (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          )}
        </div>

        <div className="mt-5 md:hidden">
          <Link className="btn btn-ghost w-full justify-center" href="/blog/">
            View all posts
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
