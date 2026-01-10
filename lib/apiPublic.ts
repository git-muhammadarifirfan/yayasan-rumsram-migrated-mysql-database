import { fetchJson } from "./http";
import type {
  SiteSettings,
  Program,
  Event,
  Post,
  GalleryItem,
  TeamMember,
  PostComment,
  GalleryUnifiedItem,
} from "./types";

export async function getSettings(): Promise<SiteSettings | null> {
  const d = await fetchJson<{ settings: SiteSettings | null }>("/api/public/settings", { method: "GET" });
  return d.settings ?? null;
}

export async function listPrograms(): Promise<Program[]> {
  const d = await fetchJson<{ items: Program[] }>("/api/public/programs", { method: "GET" });
  return d.items || [];
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const d = await fetchJson<{ item: Program | null }>(`/api/public/programs/${encodeURIComponent(slug)}`, {
    method: "GET",
  });
  return d.item || null;
}

export async function listEvents(): Promise<Event[]> {
  const d = await fetchJson<{ items: Event[] }>("/api/public/events", { method: "GET" });
  return d.items || [];
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const d = await fetchJson<{ item: Event | null }>(`/api/public/events/${encodeURIComponent(slug)}`, {
    method: "GET",
  });
  return d.item || null;
}

export async function listPosts(): Promise<Post[]> {
  const d = await fetchJson<{ items: Post[] }>("/api/public/posts", { method: "GET" });
  return d.items || [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const d = await fetchJson<{ item: Post | null }>(`/api/public/posts/${encodeURIComponent(slug)}`, {
    method: "GET",
  });
  return d.item || null;
}

export async function listGallery(): Promise<GalleryItem[]> {
  const d = await fetchJson<{ items: GalleryItem[] }>("/api/public/gallery", { method: "GET" });
  return d.items || [];
}

export async function listTeam(): Promise<TeamMember[]> {
  const d = await fetchJson<{ items: TeamMember[] }>("/api/public/team", { method: "GET" });
  return d.items || [];
}

export async function listPostComments(postId: string): Promise<PostComment[]> {
  const d = await fetchJson<{ items: PostComment[] }>(`/api/public/post-comments?postId=${encodeURIComponent(postId)}`, {
    method: "GET",
  });
  return d.items || [];
}

export async function addPostComment(params: {
  post_id: string;
  author_name: string;
  author_email?: string | null;
  content: string;
}) {
  await fetchJson(`/api/public/post-comments`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// Same logic as old Supabase implementation; now it composes public endpoints.
export async function listGalleryMixed(): Promise<GalleryUnifiedItem[]> {
  const custom = await listGallery();

  const [programs, events, posts] = await Promise.all([
    listPrograms().catch(() => []),
    listEvents().catch(() => []),
    listPosts().catch(() => []),
  ]);

  const fromPrograms = (programs as any[])
    .map((p: any) => {
      const img = p.cover_url || (Array.isArray(p.gallery_urls) ? p.gallery_urls[0] : null);
      if (!img) return null;
      return {
        id: `program-${p.id}`,
        title: p.title,
        category: "Program",
        image_url: img,
        href: `/programs/detail?slug=${encodeURIComponent(p.slug)}`,
        created_at: p.created_at,
        source: "program" as const,
      };
    })
    .filter(Boolean) as any[];

  const fromEvents = (events as any[])
    .map((e: any) => {
      if (!e.cover_url) return null;
      return {
        id: `event-${e.id}`,
        title: e.title,
        category: "Event",
        image_url: e.cover_url,
        href: `/events/detail?slug=${encodeURIComponent(e.slug)}`,
        created_at: e.created_at,
        source: "event" as const,
      };
    })
    .filter(Boolean) as any[];

  const fromPosts = (posts as any[])
    .map((p: any) => {
      if (!p.cover_url) return null;
      return {
        id: `blog-${p.id}`,
        title: p.title,
        category: "Blog",
        image_url: p.cover_url,
        href: `/blog/detail?slug=${encodeURIComponent(p.slug)}`,
        created_at: p.created_at,
        source: "blog" as const,
      };
    })
    .filter(Boolean) as any[];

  const customMapped = custom.map((g: any) => ({
    id: `custom-${g.id}`,
    title: g.title ?? null,
    category: g.category ?? "Gallery",
    image_url: g.image_url,
    href: null,
    created_at: g.created_at,
    sort_order: g.sort_order ?? null,
    source: "custom" as const,
  }));

  const all: any[] = [...customMapped, ...fromPrograms, ...fromEvents, ...fromPosts];

  all.sort((a: any, b: any) => {
    const ao = a.source === "custom" && a.sort_order != null ? Number(a.sort_order) : null;
    const bo = b.source === "custom" && b.sort_order != null ? Number(b.sort_order) : null;
    if (ao != null && bo != null) return ao - bo;
    if (ao != null) return -1;
    if (bo != null) return 1;
    const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bd - ad;
  });

  return all as any;
}
