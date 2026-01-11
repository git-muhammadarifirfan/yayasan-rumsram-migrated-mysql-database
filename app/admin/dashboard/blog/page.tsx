"use client";

import { useEffect, useMemo, useState } from "react";
import { adminListPosts, upsertPost, deletePost, adminListPostComments, adminDeletePostComment } from "@/lib/apiAdmin";
import type { Post, PostComment } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { toast } from "@/lib/toast";

const empty: Partial<Post> = {
  title: "",
  slug: "",
  excerpt: "",
  content_md: "",
  cover_url: "",
  status: "published",
  category: "",
  published_at: "",
};

export default function BlogAdminPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [comments, setComments] = useState<PostComment[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const d = await adminListPosts();
    setItems(d);
  }

  async function loadComments(postId: string) {
    try {
      const d = await adminListPostComments(postId);
      setComments(d);
    } catch (e) {
      console.error(e);
      setComments([]);
    }
  }


  useEffect(() => {
    load().catch((e) => {
      console.error(e);
      toast.error("Gagal memuat data", { description: e?.message });
    });
  }, []);

  useEffect(() => {
    if (editing?.id) {
      loadComments(String(editing.id));
    } else {
      setComments(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id]);

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
          <div className="text-2xl font-semibold">Blog</div>
          <p className="mt-2 text-sm text-muted">Artikel yang tampil di publik hanya status <span className="font-semibold">published</span>.</p>
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
              <th className="p-3">Published</th>
              <th className="p-3">Status</th>
              <th className="p-3 w-[170px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-black/5">
                <td className="p-3">
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs text-muted">{p.slug}</div>
                </td>
                <td className="p-3 text-muted">{p.published_at || "-"}</td>
                <td className="p-3">
                  <span className="badge">{p.status}</span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="btn btn-ghost" onClick={() => setEditing(p)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost"
                      disabled={busy}
                      onClick={async () => {
                        if (!confirm("Delete this post?")) return;
                        setBusy(true);
                        try {
                          await deletePost(p.id);
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
              <div className="text-lg font-semibold">{editing.id ? "Edit post" : "Add post"}</div>
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

            
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Category</label>
              <input
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                placeholder="Misal: Kegiatan, Informasi, Edukasi…"
                value={(editing as any).category ?? ""}
                onChange={(e) => setEditing((s) => ({ ...(s || {}), category: e.target.value }))}
              />
            </div>
<div className="grid gap-2">
              <label className="text-sm font-semibold">Published at</label>
              <input
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                placeholder="YYYY-MM-DD"
                value={editing.published_at ?? ""}
                onChange={(e) => setEditing((s) => ({ ...(s || {}), published_at: e.target.value }))}
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
          </div>

          <div className="mt-6">
            <ImagePicker
              label="Cover image"
              value={editing.cover_url}
              folder="blog"
              onChange={(url) => setEditing((s) => ({ ...(s || {}), cover_url: url }))}
            />
          </div>

          {editing?.id ? (
            <div className="mt-6 card p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">Moderasi Komentar</div>
                  <div className="text-sm text-muted">Hapus komentar yang tidak pantas / spam.</div>
                </div>
                <button
                  className="btn btn-ghost"
                  onClick={() => loadComments(String(editing.id))}
                  type="button"
                >
                  Refresh
                </button>
              </div>

              {!comments ? (
                <div className="mt-4 text-sm text-muted">Memuat komentar…</div>
              ) : comments.length === 0 ? (
                <div className="mt-4 text-sm text-muted">Belum ada komentar.</div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {comments.map((c) => (
                    <div key={c.id} className="rounded-2xl border border-black/10 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{c.author_name}</div>
                          <div className="mt-1 text-xs text-muted">
                            {c.author_email ? `${c.author_email} • ` : ""}
                            {new Date(c.created_at).toLocaleString("id-ID")}
                          </div>
                        </div>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={async () => {
                            if (!confirm("Hapus komentar ini?")) return;
                            try {
                              await adminDeletePostComment(c.id);
                              toast.success("Comment deleted");
                              loadComments(String(editing.id));
                            } catch (e: any) {
                              toast.error("Gagal hapus komentar", { description: e?.message });
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{c.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

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
                  await upsertPost(editing as any);
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
