"use client";

import { useEffect, useMemo, useState } from "react";
import { adminListTeam, upsertTeamMember, deleteTeamMember } from "@/lib/apiAdmin";
import type { TeamMember } from "@/lib/types";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { toast } from "@/lib/toast";

const empty: Partial<TeamMember> = {
  name: "",
  role_title: "",
  bio: "",
  photo_url: "",
  sort_order: 0,
};

export default function TeamAdminPage() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<TeamMember> | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const d = await adminListTeam();
    setItems(d);
  }

  useEffect(() => {
    load().catch((e) => {
      console.error(e);
      toast.error("Gagal memuat data", { description: e?.message });
    });
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter(
      (i) => (i.name || "").toLowerCase().includes(qq) || (i.role_title || "").toLowerCase().includes(qq)
    );
  }, [items, q]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold">Team</div>
          <p className="mt-2 text-sm text-muted">Kelola pengurus/pembina.</p>
        </div>
        <div className="flex gap-2">
          <input
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => setEditing({ ...empty })}>
            + Add
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-black/[0.03] text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Sort</th>
              <th className="p-3 w-[170px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-black/5">
                <td className="p-3 font-semibold">{t.name}</td>
                <td className="p-3 text-muted">{t.role_title || "-"}</td>
                <td className="p-3">{t.sort_order ?? 0}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="btn btn-ghost" onClick={() => setEditing(t)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost"
                      disabled={busy}
                      onClick={async () => {
                        if (!confirm("Delete this member?")) return;
                        setBusy(true);
                        try {
                          await deleteTeamMember(t.id);
                          await load();
                          toast.success("Deleted");
                        } catch (e: any) {
                          toast.error("Delete failed", { description: e?.message || "Unknown error" });
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td className="p-4 text-muted" colSpan={4}>
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="card p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">{editing.id ? "Edit member" : "Add member"}</div>
              <div className="text-sm text-muted">Name wajib diisi.</div>
            </div>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>
              Close
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Name</label>
              <input
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                value={editing.name ?? ""}
                onChange={(e) => setEditing((s) => ({ ...(s || {}), name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Role title</label>
              <input
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                value={editing.role_title ?? ""}
                onChange={(e) => setEditing((s) => ({ ...(s || {}), role_title: e.target.value }))}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-semibold">Bio</label>
              <textarea
                className="rounded-xl border border-black/10 px-3 py-2 text-sm min-h-[90px]"
                value={editing.bio ?? ""}
                onChange={(e) => setEditing((s) => ({ ...(s || {}), bio: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold">Sort order</label>
              <input
                type="number"
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                value={editing.sort_order ?? 0}
                onChange={(e) => setEditing((s) => ({ ...(s || {}), sort_order: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="mt-6">
            <ImagePicker
              label="Photo"
              value={editing.photo_url}
              folder="team"
              onChange={(url) => setEditing((s) => ({ ...(s || {}), photo_url: url }))}
            />
          </div>

          <div className="mt-6 flex gap-2">
            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  if (!editing.name?.trim()) throw new Error("Name required");
                  await upsertTeamMember(editing as any);
                  await load();
                  setEditing(null);
                  toast.success("Saved");
                } catch (e: any) {
                  toast.error("Save failed", { description: e?.message || "Unknown error" });
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Saving…" : "Save"}
            </button>
            <button className="btn btn-ghost" disabled={busy} onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
