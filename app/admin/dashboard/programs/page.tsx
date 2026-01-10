"use client";

import { useEffect, useMemo, useState } from "react";
import { adminListPrograms, upsertProgram, deleteProgram } from "@/lib/apiAdmin";
import type { Program } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { toast } from "@/lib/toast";

const empty: Partial<Program> = {
  title: "",
  slug: "",
  excerpt: "",
  content_md: "",
  cover_url: "",
  status: "published",
  sort_order: 0,
};

export default function ProgramsAdminPage() {
  const [items, setItems] = useState<Program[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Program> | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const d = await adminListPrograms();
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
      (i) => (i.title || "").toLowerCase().includes(qq) || (i.slug || "").toLowerCase().includes(qq)
    );
  }, [items, q]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold">Programs</div>
          <p className="mt-2 text-sm text-muted">Program yang tampil di publik hanya status <span className="font-semibold">published</span>.</p>
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
              <th className="p-3">Title</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Status</th>
              <th className="p-3">Sort</th>
              <th className="p-3 w-[170px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-black/5">
                <td className="p-3 font-semibold">{p.title}</td>
                <td className="p-3 text-muted">{p.slug}</td>
                <td className="p-3">
                  <span className="badge">{p.status}</span>
                </td>
                <td className="p-3">{p.sort_order ?? 0}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="btn btn-ghost" onClick={() => setEditing(p)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost"
                      disabled={busy}
                      onClick={async () => {
                        if (!confirm("Delete this program?")) return;
                        setBusy(true);
                        try {
                          await deleteProgram(p.id);
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
                <td className="p-4 text-muted" colSpan={5}>
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
              <div className="text-lg font-semibold">{editing.id ? "Edit program" : "Add program"}</div>
              <div className="text-sm text-muted">Title, slug, excerpt, dan content wajib.</div>
            </div>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>
              Close
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Title</label>
              <input
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                value={editing.title ?? ""}
                onChange={(e) => {
                  const title = e.target.value;
                  setEditing((s) => ({ ...(s || {}), title, slug: s?.slug ? s.slug : slugify(title) }));
                }}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Slug</label>
              <input
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                value={editing.slug ?? ""}
                onChange={(e) => setEditing((s) => ({ ...(s || {}), slug: e.target.value }))}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-semibold">Excerpt</label>
              <textarea
                className="rounded-xl border border-black/10 px-3 py-2 text-sm min-h-[90px]"
                value={editing.excerpt ?? ""}
                onChange={(e) => setEditing((s) => ({ ...(s || {}), excerpt: e.target.value }))}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-semibold">Content (Markdown)</label>
              <textarea
                className="rounded-xl border border-black/10 px-3 py-2 text-sm min-h-[220px]"
                value={editing.content_md ?? ""}
                onChange={(e) => setEditing((s) => ({ ...(s || {}), content_md: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold">Status</label>
              <select
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                value={editing.status ?? "published"}
                onChange={(e) => setEditing((s) => ({ ...(s || {}), status: e.target.value as any }))}
              >
                <option value="published">published</option>
                <option value="draft">draft</option>
              </select>
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
              label="Cover image"
              value={editing.cover_url}
              folder="programs"
              onChange={(url) => setEditing((s) => ({ ...(s || {}), cover_url: url }))}
            />
          </div>

          <div className="mt-6 flex gap-2">
            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  if (!editing.title?.trim() || !editing.slug?.trim()) throw new Error("Title & slug required");
                  if (!editing.excerpt?.trim()) throw new Error("Excerpt required");
                  if (!editing.content_md?.trim()) throw new Error("Content required");
                  await upsertProgram(editing as any);
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
