"use client";

import { useEffect, useMemo, useState } from "react";
import { adminListGallery, upsertGalleryItem, deleteGalleryItem } from "@/lib/apiAdmin";
import type { GalleryItem } from "@/lib/types";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { toast } from "@/lib/toast";

const empty: Partial<GalleryItem> = {
  title: "",
  category: "Aktivitas",
  image_url: "",
  sort_order: 0,
};

export default function GalleryAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<GalleryItem> | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const d = await adminListGallery();
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
      (i) => (i.title || "").toLowerCase().includes(qq) || (i.category || "").toLowerCase().includes(qq)
    );
  }, [items, q]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold">Gallery</div>
          <p className="mt-2 text-sm text-muted">Kelola foto kegiatan (upload atau link).</p>
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
              <th className="p-3">Category</th>
              <th className="p-3">Sort</th>
              <th className="p-3 w-[170px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-t border-black/5">
                <td className="p-3 font-semibold">{g.title || "-"}</td>
                <td className="p-3 text-muted">{g.category || "-"}</td>
                <td className="p-3">{g.sort_order ?? 0}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="btn btn-ghost" onClick={() => setEditing(g)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost"
                      disabled={busy}
                      onClick={async () => {
                        if (!confirm("Delete this item?")) return;
                        setBusy(true);
                        try {
                          await deleteGalleryItem(g.id);
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
              <div className="text-lg font-semibold">{editing.id ? "Edit item" : "Add item"}</div>
              <div className="text-sm text-muted">Image wajib diisi.</div>
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
                onChange={(e) => setEditing((s) => ({ ...(s || {}), title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Category</label>
              <input
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                value={editing.category ?? ""}
                onChange={(e) => setEditing((s) => ({ ...(s || {}), category: e.target.value }))}
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
              label="Image"
              value={editing.image_url}
              folder="gallery"
              onChange={(url) => setEditing((s) => ({ ...(s || {}), image_url: url }))}
            />
          </div>

          <div className="mt-6 flex gap-2">
            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  if (!editing.image_url?.trim()) throw new Error("Image URL required");
                  await upsertGalleryItem(editing as any);
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
