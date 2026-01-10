"use client";

import { useEffect, useState } from "react";
import { getSession, getMyRole, canEdit } from "@/lib/auth";
import { listPrograms, listEvents, listPosts, listGallery, listTeam } from "@/lib/apiPublic";

export default function AdminDashboardPage() {
  const [ok, setOk] = useState(false);
  const [summary, setSummary] = useState<{ programs:number; events:number; posts:number; gallery:number; team:number } | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      if (!s) { location.href = "/admin/login/"; return; }
      const role = await getMyRole();
      if (!canEdit(role)) { location.href = "/admin/login/"; return; }
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
      <div className="text-2xl font-semibold">Dashboard</div>
      <p className="mt-2 text-sm text-muted">
        Kelola semua konten website di menu kiri. Public pages akan otomatis baca data terbaru dari Supabase (tanpa rebuild).
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-muted">Programs</div>
          <div className="mt-1 text-2xl font-semibold">{summary?.programs ?? "-"}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-muted">Events</div>
          <div className="mt-1 text-2xl font-semibold">{summary?.events ?? "-"}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-muted">Blog posts</div>
          <div className="mt-1 text-2xl font-semibold">{summary?.posts ?? "-"}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-muted">Gallery</div>
          <div className="mt-1 text-2xl font-semibold">{summary?.gallery ?? "-"}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-muted">Team</div>
          <div className="mt-1 text-2xl font-semibold">{summary?.team ?? "-"}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-muted">Role</div>
          <div className="mt-1 text-2xl font-semibold">admin/editor</div>
        </div>
      </div>
    </div>
  );
}
