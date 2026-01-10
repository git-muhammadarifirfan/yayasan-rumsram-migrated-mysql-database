"use client";

import { useEffect, useMemo, useState } from "react";
import { adminListEvents, upsertEvent, deleteEvent } from "@/lib/apiAdmin";
import type { Event } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { toast } from "@/lib/toast";

const empty: Partial<Event> = {
  title: "",
  slug: "",
  excerpt: "",
  content_md: "",
  event_date: "",
  location: "",
  cover_url: "",
  status: "published",
  sort_order: 0,
};

export default function EventsAdminPage() {
  const [items, setItems] = useState<Event[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Event> | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const d = await adminListEvents();
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
          <div className="text-2xl font-semibold">Events</div>
          <p className="mt-2 text-sm text-muted">Event yang tampil di publik hanya status <span className="font-semibold">published</span>.</p>
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
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Sort</th>
              <th className="p-3 w-[170px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t border-black/5">
                <td className="p-3">
                  <div className="font-semibold">{e.title}</div>
                  <div className="text-xs text-muted">{e.slug}</div>
                </td>
                <td className="p-3 text-muted">{e.event_date || "-"}</td>
                <td className="p-3">
                  <span className="badge">{e.status}</span>
                </td>
                <td className="p-3">{e.sort_order ?? 0}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="btn btn-ghost" onClick={() => setEditing(e)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost"
                      disabled={busy}
                      onClick={async () => {
                        if (!confirm("Delete this event?")) return;
                        setBusy(true);
                        try {
                          await deleteEvent(e.id);
                          await load();
                          toast.success("Deleted");
                        } catch (err: any) {
                          toast.error("Delete failed", { description: err?.message || "Unknown error" });
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
              <div className="text-lg font-semibold">{editing.id ? "Edit event" : "Add event"}</div>
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
                onChange={(ev) => {
                  const title = ev.target.value;
                  setEditing((s) => ({ ...(s || {}), title, slug: s?.slug ? s.slug : slugify(title) }));
                }}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Slug</label>
              <input
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                value={editing.slug ?? ""}
                onChange={(ev) => setEditing((s) => ({ ...(s || {}), slug: ev.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold">Event date</label>
              <input
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                placeholder="YYYY-MM-DD"
                value={editing.event_date ?? ""}
                onChange={(ev) => setEditing((s) => ({ ...(s || {}), event_date: ev.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Location</label>
              <input
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                value={editing.location ?? ""}
                onChange={(ev) => setEditing((s) => ({ ...(s || {}), location: ev.target.value }))}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-semibold">Excerpt</label>
              <textarea
                className="rounded-xl border border-black/10 px-3 py-2 text-sm min-h-[90px]"
                value={editing.excerpt ?? ""}
                onChange={(ev) => setEditing((s) => ({ ...(s || {}), excerpt: ev.target.value }))}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-semibold">Content (Markdown)</label>
              <textarea
                className="rounded-xl border border-black/10 px-3 py-2 text-sm min-h-[220px]"
                value={editing.content_md ?? ""}
                onChange={(ev) => setEditing((s) => ({ ...(s || {}), content_md: ev.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold">Status</label>
              <select
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                value={editing.status ?? "published"}
                onChange={(ev) => setEditing((s) => ({ ...(s || {}), status: ev.target.value as any }))}
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
                onChange={(ev) => setEditing((s) => ({ ...(s || {}), sort_order: Number(ev.target.value) }))}
              />
            </div>
          </div>

          <div className="mt-6">
            <ImagePicker
              label="Cover image"
              value={editing.cover_url}
              folder="events"
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
                  await upsertEvent(editing as any);
                  await load();
                  setEditing(null);
                  toast.success("Saved");
                } catch (err: any) {
                  toast.error("Save failed", { description: err?.message || "Unknown error" });
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
