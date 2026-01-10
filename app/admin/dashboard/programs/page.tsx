"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { adminListPrograms, upsertProgram, deleteProgram } from "@/lib/apiAdmin";
import type { Program } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { toast } from "@/lib/toast";

/* =========================
   Defaults
========================= */
const empty: Partial<Program> = {
  title: "",
  slug: "",
  excerpt: "",
  content_md: "",
  cover_url: "",
  status: "published",
  sort_order: 0,
};

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

/* =========================
   Modal (mobile-first, no overflow)
========================= */
function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function Modal({
  open,
  title,
  description,
  children,
  onClose,
  footer,
  maxW = "sm:max-w-4xl",
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  maxW?: string;
}) {
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Dialog */}
      <div
        className={cx(
          "relative w-full bg-white",
          "h-[100dvh] sm:h-auto",
          "sm:rounded-2xl sm:border sm:border-orange-200/60 sm:shadow-2xl",
          maxW
        )}
      >
        {/* Header (sticky on mobile) */}
        <div className="sticky top-0 z-10 border-b border-orange-100 bg-white/95 backdrop-blur px-4 py-4 sm:rounded-t-2xl sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-base font-bold text-slate-900 sm:text-lg">
                {title}
              </div>
              {description ? (
                <div className="mt-1 text-sm text-slate-600">{description}</div>
              ) : null}
            </div>

            <button
              type="button"
              className={cx(
                "shrink-0 rounded-xl px-3 py-2 text-sm font-semibold",
                "border border-orange-200 text-orange-700 hover:bg-orange-50"
              )}
              onClick={onClose}
              aria-label="Close"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Body (scroll area) */}
        <div
          className={cx(
            "px-4 py-4 sm:px-5",
            "max-h-[calc(100dvh-132px)] sm:max-h-[70vh] overflow-auto"
          )}
        >
          {children}
        </div>

        {/* Footer (sticky on mobile) */}
        {footer ? (
          <div className="sticky bottom-0 border-t border-orange-100 bg-white/95 backdrop-blur px-4 py-4 sm:rounded-b-2xl sm:px-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

/* =========================
   UI atoms (consistent white + orange)
========================= */
function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <label className="text-sm font-semibold text-slate-800">{children}</label>
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-xl px-3 py-2 text-sm",
        "border border-orange-200/70 bg-white text-slate-900 placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300",
        props.className
      )}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        "w-full rounded-xl px-3 py-2 text-sm",
        "border border-orange-200/70 bg-white text-slate-900 placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300",
        props.className
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "w-full rounded-xl px-3 py-2 text-sm",
        "border border-orange-200/70 bg-white text-slate-900",
        "focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300",
        props.className
      )}
    />
  );
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "rounded-xl px-4 py-2 text-sm font-semibold",
        "bg-orange-600 text-white hover:bg-orange-700",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        props.className
      )}
    />
  );
}
function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "rounded-xl px-4 py-2 text-sm font-semibold",
        "border border-orange-200 text-orange-700 hover:bg-orange-50",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        props.className
      )}
    />
  );
}
function DangerButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "rounded-xl px-4 py-2 text-sm font-semibold",
        "border border-red-200 text-red-700 hover:bg-red-50",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        props.className
      )}
    />
  );
}

function Badge({ status }: { status?: Program["status"] }) {
  const published = status === "published";
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
        published
          ? "border-orange-200 bg-orange-50 text-orange-700"
          : "border-slate-200 bg-slate-50 text-slate-700"
      )}
    >
      {published ? "published" : "draft"}
    </span>
  );
}

/* =========================
   Page
========================= */
export default function ProgramsAdminPage() {
  const [items, setItems] = useState<Program[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Program> | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Program | null>(null);

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
      (i) =>
        (i.title || "").toLowerCase().includes(qq) ||
        (i.slug || "").toLowerCase().includes(qq)
    );
  }, [items, q]);

  function openCreate() {
    setEditing({ ...empty });
  }
  function openEdit(p: Program) {
    setEditing({ ...p });
  }

  async function onSave() {
    setBusy(true);
    try {
      if (!editing) return;

      if (!editing.title?.trim() || !editing.slug?.trim())
        throw new Error("Title & slug wajib diisi");
      if (!editing.excerpt?.trim()) throw new Error("Excerpt wajib diisi");
      if (!editing.content_md?.trim()) throw new Error("Content wajib diisi");

      await upsertProgram(editing as any);
      await load();
      setEditing(null);
      toast.success("Tersimpan");
    } catch (e: any) {
      toast.error("Gagal menyimpan", { description: e?.message || "Unknown error" });
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteConfirm() {
    if (!confirmDel) return;
    setBusy(true);
    try {
      await deleteProgram(confirmDel.id);
      await load();
      toast.success("Berhasil dihapus");
      setConfirmDel(null);
    } catch (e: any) {
      toast.error("Gagal menghapus", { description: e?.message || "Unknown error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      {/* Top bar */}
      <div className="rounded-2xl border border-orange-200/60 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-xl font-bold text-slate-900">Programs</div>
            <p className="mt-1 text-sm text-slate-600">
              Program yang tampil di publik hanya status{" "}
              <span className="font-semibold text-orange-700">published</span>.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full sm:w-[300px]">
              <Input
                placeholder="Cari title / slug…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pr-14"
              />
              {!!q && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-50"
                  onClick={() => setQ("")}
                >
                  Clear
                </button>
              )}
            </div>

            <PrimaryButton type="button" onClick={openCreate}>
              + Add
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-orange-200/60 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-orange-50 text-left">
            <tr>
              <th className="p-3 font-semibold text-slate-700">Title</th>
              <th className="p-3 font-semibold text-slate-700">Slug</th>
              <th className="p-3 font-semibold text-slate-700">Status</th>
              <th className="p-3 font-semibold text-slate-700">Sort</th>
              <th className="p-3 w-[190px] font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-orange-100">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-xl border border-orange-200/60 bg-orange-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.cover_url ? (
                        <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{p.title}</div>
                      <div className="text-xs text-slate-500 truncate">{p.excerpt || "—"}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-slate-600">{p.slug}</td>
                <td className="p-3">
                  <Badge status={p.status} />
                </td>
                <td className="p-3 text-slate-700">{p.sort_order ?? 0}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <SecondaryButton type="button" onClick={() => openEdit(p)}>
                      Edit
                    </SecondaryButton>
                    <DangerButton type="button" disabled={busy} onClick={() => setConfirmDel(p)}>
                      Delete
                    </DangerButton>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td className="p-4 text-slate-500" colSpan={5}>
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards (no overflow, clean) */}
      <div className="grid gap-3 sm:hidden">
        {!filtered.length ? (
          <div className="rounded-2xl border border-orange-200/60 bg-white p-4 text-sm text-slate-600">
            No data
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="rounded-2xl border border-orange-200/60 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{p.title}</div>
                  <div className="mt-1 text-xs text-slate-500 break-words">{p.slug}</div>
                </div>
                <div className="shrink-0">
                  <Badge status={p.status} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-600">Sort: {p.sort_order ?? 0}</div>
                <div className="flex gap-2">
                  <SecondaryButton type="button" onClick={() => openEdit(p)}>
                    Edit
                  </SecondaryButton>
                  <DangerButton type="button" disabled={busy} onClick={() => setConfirmDel(p)}>
                    Delete
                  </DangerButton>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={!!editing}
        onClose={() => {
          if (busy) return;
          setEditing(null);
        }}
        title={editing?.id ? "Edit Program" : "Add Program"}
        description="Isi Title, Slug, Excerpt, dan Content. Published akan tampil di publik."
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              Tips: judul otomatis membuat slug (jika slug masih kosong).
            </div>
            <div className="flex gap-2 sm:justify-end">
              <SecondaryButton type="button" disabled={busy} onClick={() => setEditing(null)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="button" disabled={busy} onClick={onSave}>
                {busy ? "Saving…" : "Save"}
              </PrimaryButton>
            </div>
          </div>
        }
      >
        {editing ? (
          <div className="grid gap-4">
            {/* Form grid: 1 col on mobile, 2 col on >=sm */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label hint="Wajib">Title</Label>
                <Input
                  value={editing.title ?? ""}
                  placeholder="Contoh: Pelatihan Literasi Digital"
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditing((s) => ({
                      ...(s || {}),
                      title,
                      slug: s?.slug ? s.slug : slugify(title),
                    }));
                  }}
                />
              </div>

              <div className="grid gap-2">
                <Label hint="Wajib">Slug</Label>
                <Input
                  value={editing.slug ?? ""}
                  placeholder="contoh: pelatihan-literasi-digital"
                  onChange={(e) => setEditing((s) => ({ ...(s || {}), slug: e.target.value }))}
                />
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <Label hint="Wajib">Excerpt</Label>
                <Textarea
                  className="min-h-[96px]"
                  value={editing.excerpt ?? ""}
                  placeholder="Ringkasan singkat program…"
                  onChange={(e) => setEditing((s) => ({ ...(s || {}), excerpt: e.target.value }))}
                />
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <Label hint="Wajib">Content (Markdown)</Label>
                <Textarea
                  className="min-h-[240px]"
                  value={editing.content_md ?? ""}
                  placeholder={"Tulis konten detail dalam markdown…\n\n## Judul\n- poin\n- poin"}
                  onChange={(e) => setEditing((s) => ({ ...(s || {}), content_md: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={editing.status ?? "published"}
                  onChange={(e) => setEditing((s) => ({ ...(s || {}), status: e.target.value as any }))}
                >
                  <option value="published">published</option>
                  <option value="draft">draft</option>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label hint="Angka kecil tampil dulu">Sort order</Label>
                <Input
                  type="number"
                  value={editing.sort_order ?? 0}
                  onChange={(e) => setEditing((s) => ({ ...(s || {}), sort_order: Number(e.target.value) }))}
                />
              </div>
            </div>

            {/* Cover */}
            <div className="rounded-2xl border border-orange-200/60 bg-orange-50/40 p-4">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-bold text-slate-900">Cover image</div>
                <div className="text-xs text-slate-600">Pilih gambar cover untuk program.</div>
              </div>
              <div className="mt-3">
                <ImagePicker
                  label="Cover image"
                  value={editing.cover_url}
                  folder="programs"
                  onChange={(url) => setEditing((s) => ({ ...(s || {}), cover_url: url }))}
                />
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Delete confirm Modal */}
      <Modal
        open={!!confirmDel}
        onClose={() => {
          if (busy) return;
          setConfirmDel(null);
        }}
        title="Hapus program?"
        description="Aksi ini tidak bisa dibatalkan."
        maxW="sm:max-w-xl"
        footer={
          <div className="flex w-full gap-2 sm:justify-end">
            <SecondaryButton type="button" disabled={busy} onClick={() => setConfirmDel(null)}>
              Batal
            </SecondaryButton>
            <DangerButton type="button" disabled={busy} onClick={onDeleteConfirm}>
              {busy ? "Deleting…" : "Ya, hapus"}
            </DangerButton>
          </div>
        }
      >
        <div className="rounded-2xl border border-orange-200/60 bg-orange-50/40 p-4">
          <div className="text-sm text-slate-700">Yang akan dihapus:</div>
          <div className="mt-1 text-base font-bold text-slate-900">{confirmDel?.title || "—"}</div>
          <div className="mt-1 text-sm text-slate-600 break-words">
            Slug: <span className="font-semibold text-slate-800">{confirmDel?.slug}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
