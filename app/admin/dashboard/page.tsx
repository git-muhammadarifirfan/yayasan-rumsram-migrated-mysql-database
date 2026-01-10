"use client";

import { useEffect, useMemo, useState } from "react";
import { getSession, getMyRole, canEdit } from "@/lib/auth";
import {
  listPrograms,
  listEvents,
  listPosts,
  listGallery,
  listTeam,
} from "@/lib/apiPublic";
import {
  BookOpen,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Layers3,
  Users,
} from "lucide-react";

type Summary = {
  programs: number;
  events: number;
  posts: number;
  gallery: number;
  team: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function AnimatedNumber({
  value,
  duration = 900,
}: {
  value: number | null | undefined;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value == null || Number.isNaN(value)) {
      setDisplay(0);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const from = 0;
    const to = Math.max(0, Math.floor(value));

    const tick = (now: number) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = easeOutCubic(t);
      const next = Math.round(from + (to - from) * eased);
      setDisplay(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    setDisplay(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span>{display}</span>;
}

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function StatCard({
  label,
  value,
  icon,
  accent,
  loading,
}: {
  label: string;
  value: number | null | undefined;
  icon: React.ReactNode;
  accent: "amber" | "emerald" | "sky" | "violet" | "rose";
  loading?: boolean;
}) {
  const accentClass = useMemo(() => {
    // background + ring accent
    switch (accent) {
      case "amber":
        return "bg-amber-500/10 ring-amber-400/20";
      case "emerald":
        return "bg-emerald-500/10 ring-emerald-400/20";
      case "sky":
        return "bg-sky-500/10 ring-sky-400/20";
      case "violet":
        return "bg-violet-500/10 ring-violet-400/20";
      case "rose":
        return "bg-rose-500/10 ring-rose-400/20";
      default:
        return "bg-white/5 ring-white/10";
    }
  }, [accent]);

  return (
    <div
      className={cx(
        "card p-5 ring-1 transition",
        "hover:-translate-y-0.5 hover:shadow-lg",
        "bg-gradient-to-b from-white/[0.06] to-white/[0.03]",
        accentClass
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-muted">{label}</div>

          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-lg bg-white/10" />
            ) : (
              <AnimatedNumber value={value ?? 0} />
            )}
          </div>

          <div className="mt-2 text-xs text-muted">
            {loading ? "Mengambil data…" : "Data terbaru dari database"}
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const manualBookUrl =
    "https://drive.google.com/drive/folders/REPLACE_THIS_WITH_YOUR_DRIVE_LINK"; // <- ganti link Drive manual book di sini

  const [ok, setOk] = useState(false);
  const [role, setRole] = useState<string>("-");
  const [summary, setSummary] = useState<Summary | null>(null);
  const loading = ok && !summary;

  useEffect(() => {
    (async () => {
      const s = await getSession();
      if (!s) {
        location.href = "/admin/login/";
        return;
      }

      const r = await getMyRole();
      if (!canEdit(r)) {
        location.href = "/admin/login/";
        return;
      }

      setRole(String(r || "admin/editor"));
      setOk(true);

      const [programs, events, posts, gallery, team] = await Promise.all([
        listPrograms().catch(() => []),
        listEvents().catch(() => []),
        listPosts().catch(() => []),
        listGallery().catch(() => []),
        listTeam().catch(() => []),
      ]);

      setSummary({
        programs: programs.length,
        events: events.length,
        posts: posts.length,
        gallery: gallery.length,
        team: team.length,
      });
    })();
  }, []);

  if (!ok) return <div className="text-sm text-muted">Checking session…</div>;

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold">Dashboard</div>
          <p className="mt-2 text-sm text-muted">
            Semua fitur pengelolaan website tersedia pada menu sebelah kiri.
            Gunakan navigasi ini untuk mengatur konten utama, memperbarui
            informasi, menambah data baru, serta melakukan perubahan kapan saja
            tanpa perlu pengaturan teknis yang rumit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white/5 px-3 py-1 text-xs ring-1 ring-white/10">
            Role: <span className="font-semibold">{role}</span>
          </div>
        </div>
      </div>

      {/* Helper banner */}
      <div
        className={cx(
          "mt-6 rounded-2xl p-4 ring-1",
          "bg-gradient-to-r from-amber-500/10 via-white/[0.03] to-sky-500/10",
          "ring-white/10"
        )}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">
              Bingung pakai web admin ini?
            </div>
            <div className="mt-1 text-sm text-muted">
              Klik tombol{" "}
              <span className="font-semibold">Open Manual Book</span> untuk
              panduan penggunaan lengkap.
            </div>
          </div>
          <a
            href={manualBookUrl}
            target="_blank"
            rel="noreferrer"
            className={cx(
              "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
              "bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
            )}
          >
            <BookOpen className="h-4 w-4" />
            Buka Manual Book
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Programs"
          value={summary?.programs}
          loading={loading}
          accent="emerald"
          icon={<Layers3 className="h-5 w-5 opacity-80" />}
        />
        <StatCard
          label="Events"
          value={summary?.events}
          loading={loading}
          accent="sky"
          icon={<CalendarDays className="h-5 w-5 opacity-80" />}
        />
        <StatCard
          label="Blog posts"
          value={summary?.posts}
          loading={loading}
          accent="violet"
          icon={<FileText className="h-5 w-5 opacity-80" />}
        />
        <StatCard
          label="Gallery"
          value={summary?.gallery}
          loading={loading}
          accent="rose"
          icon={<ImageIcon className="h-5 w-5 opacity-80" />}
        />
        <StatCard
          label="Team"
          value={summary?.team}
          loading={loading}
          accent="amber"
          icon={<Users className="h-5 w-5 opacity-80" />}
        />
        <div className="card p-5 bg-gradient-to-b from-white/[0.06] to-white/[0.03] ring-1 ring-white/10">
          <div className="text-xs text-muted">Status</div>
          <div className="mt-2 text-xl font-semibold">
            {loading ? (
              <div className="h-6 w-28 animate-pulse rounded-lg bg-white/10" />
            ) : (
              "Ready"
            )}
          </div>
          <div className="mt-2 text-xs text-muted">
            {loading ? "Sinkronisasi data…" : "Kamu bisa mulai kelola konten."}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={manualBookUrl}
              target="_blank"
              rel="noreferrer"
              className={cx(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold",
                "bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
              )}
            >
              <BookOpen className="h-4 w-4" />
              Manual Book
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
