"use client";

import { PublicShell } from "@/components/PublicShell";
import { SectionReveal } from "@/components/SectionReveal";
import { Markdown } from "@/components/Markdown";
import { Skeleton } from "@/components/Skeleton";
import { listTeam } from "@/lib/apiPublic";
import type { TeamMember } from "@/lib/types";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { useEffect, useMemo, useState } from "react";

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function normalizeGroupTitle(roleTitle?: string | null) {
  const t = (roleTitle || "").toLowerCase();
  if (t.includes("pembina")) return "Pembina";
  if (t.includes("pengawas")) return "Pengawas";
  if (t.includes("penasihat") || t.includes("penasehat")) return "Penasihat";
  if (
    t.includes("pengurus") ||
    t.includes("ketua") ||
    t.includes("wakil") ||
    t.includes("sekretaris") ||
    t.includes("bendahara")
  )
    return "Pengurus";
  return "Tim";
}

function roleRank(roleTitle?: string | null) {
  const t = (roleTitle || "").toLowerCase();
  if (t.includes("ketua")) return 1;
  if (t.includes("wakil")) return 2;
  if (t.includes("sekretaris")) return 3;
  if (t.includes("bendahara")) return 4;
  return 10;
}

type TimelineRow =
  | { type: "sep"; label: string }
  | { type: "member"; group: string; member: TeamMember };

function MemberCard({
  m,
  group,
  align,
}: {
  m: TeamMember;
  group: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cx(
        "w-full max-w-[540px] rounded-2xl border border-black/10 bg-white p-5 shadow-sm",
        "transition hover:shadow-md",
        align === "right" ? "ml-auto text-right" : "mr-auto text-left"
      )}
    >
      <div
        className={cx(
          "flex flex-wrap items-center gap-2",
          align === "right" ? "justify-end" : "justify-between"
        )}
      >
        <div className="min-w-0 text-base font-semibold text-black">
          <span className="block truncate">{m.name}</span>
        </div>
        <div className="shrink-0 rounded-full bg-black/5 px-3 py-1 text-xs text-muted">
          {m.role_title || group}
        </div>
      </div>

      {m.bio ? (
        <p className={cx("mt-2 text-sm leading-relaxed text-muted", align === "right" && "text-right")}>
          {m.bio}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">—</p>
      )}
    </div>
  );
}

function TeamTimeline({ rows }: { rows: TimelineRow[] }) {
  // memberIndex hanya menghitung member (separator tidak)
  let memberIndex = -1;

  return (
    <div className="relative mt-10">
      {/* ===== Desktop center line ===== */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-black/10 lg:block" />

      {/* ===== Mobile/tablet left line ===== */}
      <div className="pointer-events-none absolute inset-y-0 left-[14px] w-px bg-black/10 lg:hidden" />

      <ul className="space-y-7">
        {rows.map((r, i) => {
          // ===== Separator =====
          if (r.type === "sep") {
            return (
              <li key={`sep-${r.label}-${i}`} className="relative">
                {/* Mobile: left aligned, keep spacing from line */}
                <div className="lg:hidden pl-10">
                  <span className="relative z-10 inline-flex whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black shadow-sm">
                    {r.label}
                  </span>
                </div>

                {/* Desktop: centered on the line */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:items-center">
                  <div className="col-span-12 flex justify-center">
                    <span className="relative z-10 inline-flex whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black shadow-sm">
                      {r.label}
                    </span>
                  </div>

                  {/* Center node (behind label) */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
                    <div className="h-6 w-6 rounded-full border border-black/15 bg-white" />
                    <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60" />
                  </div>
                </div>
              </li>
            );
          }

          // ===== Member row =====
          memberIndex += 1;
          const isRight = memberIndex % 2 === 1;

          return (
            <li key={String(r.member.id)} className="relative">
              {/* ===== Mobile/tablet: single column ===== */}
              <div className="lg:hidden">
                <div className="relative flex gap-4 pl-6">
                  {/* node */}
                  <div className="relative mt-2">
                    <div className="h-7 w-7 rounded-full border border-black/15 bg-white shadow-sm" />
                    <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60" />
                  </div>

                  {/* card */}
                  <div className="flex-1">
                    <MemberCard m={r.member} group={r.group} />
                  </div>
                </div>

                {/* small connector from line to node */}
                <div className="pointer-events-none absolute left-[14px] top-[20px] h-px w-4 bg-black/10" />
              </div>

              {/* ===== Desktop: zig-zag grid ===== */}
              <div className="hidden lg:grid lg:grid-cols-12 lg:items-start lg:gap-6">
                {/* Left side card */}
                <div className={cx("col-span-5", isRight && "opacity-0")}>
                  {!isRight && <MemberCard m={r.member} group={r.group} align="right" />}
                </div>

                {/* Center node column */}
                <div className="relative col-span-2 flex justify-center">
                  {/* node */}
                  <div className="relative mt-3">
                    <div className="h-7 w-7 rounded-full border border-black/15 bg-white shadow-sm" />
                    <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60" />
                  </div>

                  {/* connector line to card */}
                  <div
                    className={cx(
                      "pointer-events-none absolute top-[26px] h-px w-10 bg-black/10",
                      isRight ? "left-1/2" : "right-1/2"
                    )}
                  />
                </div>

                {/* Right side card */}
                <div className={cx("col-span-5", !isRight && "opacity-0")}>
                  {isRight && <MemberCard m={r.member} group={r.group} align="left" />}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function AboutPage() {
  // Ambil settings dari cache hook (dipakai juga oleh PublicShell)
  const { settings } = useSiteSettings();
  const [team, setTeam] = useState<TeamMember[] | null>(null);

  useEffect(() => {
    listTeam().then(setTeam).catch(() => setTeam([]));
  }, []);

  const timelineRows = useMemo<TimelineRow[]>(() => {
    const list = team ?? [];

    const map = new Map<string, TeamMember[]>();
    list.forEach((m) => {
      const g = normalizeGroupTitle(m.role_title);
      map.set(g, [...(map.get(g) || []), m]);
    });

    const order = ["Pembina", "Pengawas", "Penasihat", "Pengurus", "Tim"];
    const groups = Array.from(map.entries()).sort(([a], [b]) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    const rows: TimelineRow[] = [];
    for (const [g, members] of groups) {
      const sorted = [...members].sort((a, b) => {
        const ra = roleRank(a.role_title);
        const rb = roleRank(b.role_title);
        if (ra !== rb) return ra - rb;
        return (a.name || "").localeCompare(b.name || "");
      });

      rows.push({ type: "sep", label: g });
      sorted.forEach((m) => rows.push({ type: "member", group: g, member: m }));
    }
    return rows;
  }, [team]);

  return (
    <PublicShell>
      <section className="container-xl py-14">
        {/* HERO (center) */}
        <SectionReveal>
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="badge">About us</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight lg:text-5xl">
              {settings?.org_name ? settings.org_name : <span className="inline-block"><Skeleton className="h-10 w-64 rounded-2xl" /></span>}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              {settings?.tagline ? settings.tagline : (<span className="block"><Skeleton className="h-5 w-full rounded-md" /><Skeleton className="mt-2 h-5 w-10/12 rounded-md" /><Skeleton className="mt-2 h-5 w-8/12 rounded-md" /></span>)}
            </p>
          </div>
        </SectionReveal>

        {/* CONTENT GRID */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          {/* PROFILE (center title, content justify) */}
          <SectionReveal className="card p-8">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <h2 className="text-xl font-semibold">Profile</h2>
              <p className="mt-2 text-sm text-muted">Profil yayasan dan ruang lingkup kegiatan.</p>
            </div>

            <div className="mt-6">
              {settings ? (
                <div className="prose prose-sm mx-auto max-w-none text-black">
                  {/* ini yang bikin rata kanan-kiri */}
                  <div className="text-justify leading-relaxed">
                    <Markdown value={settings.about_long} />
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              )}
            </div>
          </SectionReveal>

          {/* SIDE */}
          <div className="grid gap-6">
            <SectionReveal className="card p-8">
              <div className="text-center">
                <div className="text-xs uppercase tracking-wide text-muted">Direction</div>
                <h3 className="mt-2 text-lg font-semibold">Vision & Mission</h3>
              </div>

              <div className="mt-6 grid gap-6">
                <div>
                  <div className="text-sm font-semibold">Vision</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{settings?.vision || "-"}</p>
                </div>

                <div className="border-t border-black/5 pt-5">
                  <div className="text-sm font-semibold">Mission</div>
                  <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted">
                    {(settings?.mission_items || []).length ? (
                      (settings?.mission_items || []).map((m, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-black/40" />
                          <span>{m}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted">-</li>
                    )}
                  </ul>
                </div>
              </div>
            </SectionReveal>

            <SectionReveal className="card p-8">
              <div className="text-center">
                <div className="text-xs uppercase tracking-wide text-muted">Principles</div>
                <h3 className="mt-2 text-lg font-semibold">Values</h3>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {(settings?.values_items || ["Integritas", "Kolaborasi", "Keberlanjutan"]).map(
                  (v, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-medium text-black"
                    >
                      {v}
                    </span>
                  )
                )}
              </div>
            </SectionReveal>
          </div>
        </div>

        {/* TEAM (Connected Zig-Zag, responsive) */}
        <SectionReveal className="mt-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="badge">Our team</div>
            <h2 className="mt-4 text-2xl font-semibold">Pengurus & Pembina</h2>
            <p className="mt-2 text-sm text-muted">
              Menampilkan struktur organisasi Yayasan Rumsram yang terdiri dari Pembina, Pengurus, dan unsur terkait lainnya. Seluruh data kepengurusan dikelola secara terpusat.
            </p>
          </div>

          {team ? (
            timelineRows.length ? (
              <TeamTimeline rows={timelineRows} />
            ) : (
              <div className="mt-8 card p-8 text-center">
                <div className="text-lg font-semibold">Belum ada data tim</div>
                <p className="mt-2 text-sm text-muted">Tambahkan anggota tim lewat admin page.</p>
              </div>
            )
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-3 h-6 w-4/5" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-5/6" />
                </div>
              ))}
            </div>
          )}
        </SectionReveal>
      </section>
    </PublicShell>
  );
}
