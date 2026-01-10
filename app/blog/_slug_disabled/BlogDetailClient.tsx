"use client";

import { PublicShell } from "@/components/PublicShell";
import { SectionReveal } from "@/components/SectionReveal";
import { Markdown } from "@/components/Markdown";
import { Skeleton } from "@/components/Skeleton";
import { SmartImage } from "@/components/SmartImage";
import { addPostComment, getPostBySlug, listPostComments } from "@/lib/apiPublic";
import type { Post, PostComment } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MessageSquareText, User } from "lucide-react";

function fmtDate(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "2-digit" });
}

export default function BlogDetailClient({ slug }: { slug: string }) {
  const [item, setItem] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<PostComment[] | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const postId = item?.id || "";

  useEffect(() => {
    setLoading(true);
    setErr(null);
    getPostBySlug(slug)
      .then((d) => setItem(d))
      .catch((e) => setErr(e?.message || "Gagal memuat artikel"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!postId) return;
    setCommentLoading(true);
    listPostComments(postId)
      .then((d) => setComments(d))
      .catch(() => setComments([]))
      .finally(() => setCommentLoading(false));
  }, [postId]);

  const meta = useMemo(() => {
    if (!item) return null;
    return {
      date: item.published_at ? fmtDate(item.published_at) : null,
      author: item.author_email || null, // sudah dimasking dari API publik
      commentCount: typeof item.comment_count === "number" ? item.comment_count : null,
    };
  }, [item]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSentOk(null);

    if (!postId) return;
    const n = name.trim();
    const c = content.trim();
    const em = email.trim();

    if (!n) return setErr("Nama wajib diisi.");
    if (!c) return setErr("Komentar wajib diisi.");
    if (n.length > 80) return setErr("Nama terlalu panjang.");
    if (c.length > 2000) return setErr("Komentar terlalu panjang.");
    if (em.length > 160) return setErr("Email terlalu panjang.");

    setSending(true);
    try {
      await addPostComment({
        post_id: postId,
        author_name: n,
        author_email: em ? em : null,
        content: c,
      });
      setName("");
      setEmail("");
      setContent("");
      setSentOk("Komentar terkirim.");
      // refresh
      setCommentLoading(true);
      const d = await listPostComments(postId);
      setComments(d);
    } catch (e: any) {
      setErr(e?.message || "Gagal mengirim komentar.");
    } finally {
      setCommentLoading(false);
      setSending(false);
    }
  }

  return (
    <PublicShell>
      <section className="container-xl py-12">
        <SectionReveal>
          <Link href="/blog/" className="text-sm font-semibold text-brand-700">
            Back to blog
          </Link>

          {loading ? (
            <div className="mt-4 grid gap-3">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-6 h-56 w-full rounded-2xl" />
              <Skeleton className="mt-6 h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : item ? (
            <>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">{item.title}</h1>
              {item.excerpt ? <p className="mt-3 text-muted max-w-2xl">{item.excerpt}</p> : null}

              {/* meta */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                {meta?.date ? (
                  <span className="badge inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {meta.date}
                  </span>
                ) : null}
                {meta?.author ? (
                  <span className="badge inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {meta.author}
                  </span>
                ) : null}
                {meta?.commentCount != null ? (
                  <span className="badge inline-flex items-center gap-1">
                    <MessageSquareText className="h-3.5 w-3.5" />
                    {meta.commentCount}
                  </span>
                ) : null}
              </div>

              <div className="mt-8">
                <SmartImage src={item.cover_url} alt={item.title} ratio="16/10" className="shadow-soft" />
              </div>

              <div className="mt-8 card p-7">
                <Markdown value={item.content_md} />
              </div>

              {/* comments */}
              <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="card p-7">
                  <div className="text-lg font-semibold">Komentar</div>

                  {commentLoading ? (
                    <div className="mt-4 grid gap-3">
                      <Skeleton className="h-4 w-3/5" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-16 w-full rounded-2xl" />
                    </div>
                  ) : comments && comments.length ? (
                    <div className="mt-4 grid gap-4">
                      {comments.map((c) => (
                        <div key={c.id} className="rounded-2xl border border-black/10 bg-white p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm font-semibold">{c.author_name}</div>
                            <div className="text-xs text-muted">{fmtDate(c.created_at)}</div>
                          </div>
                          <div className="mt-2 whitespace-pre-line text-sm text-slate">{c.content}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-sm text-muted">Belum ada komentar.</div>
                  )}
                </div>

                <div className="card p-7">
                  <div className="text-lg font-semibold">Tulis komentar</div>
                  <p className="mt-2 text-sm text-muted">Komentar akan tampil setelah berhasil dikirim.</p>

                  <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
                    <input
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand-600/40 focus:ring-4 focus:ring-brand-600/10"
                      placeholder="Nama"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand-600/40 focus:ring-4 focus:ring-brand-600/10"
                      placeholder="Email (opsional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                    />
                    <textarea
                      className="min-h-[120px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand-600/40 focus:ring-4 focus:ring-brand-600/10"
                      placeholder="Komentar"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />

                    {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div> : null}
                    {sentOk ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {sentOk}
                      </div>
                    ) : null}

                    <button className="btn btn-primary" type="submit" disabled={sending}>
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-6 card p-7">
              <h2 className="text-xl font-semibold">Artikel tidak ditemukan</h2>
              <p className="mt-2 text-sm text-muted">Cek slug atau kembali ke daftar.</p>
            </div>
          )}

          {err && !loading ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
          ) : null}
        </SectionReveal>
      </section>
    </PublicShell>
  );
}
