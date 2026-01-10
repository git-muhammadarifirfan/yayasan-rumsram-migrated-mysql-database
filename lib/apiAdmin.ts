import { fetchJson } from "./http";
import type { SiteSettings, Program, Event, Post, GalleryItem, TeamMember } from "./types";

// small helper: ensure cookie session exists
export async function requireAuth() {
  const d = await fetchJson<{ session: any | null }>("/api/auth/me", { method: "GET" });
  if (!d.session) throw new Error("Not authenticated");
  return d.session;
}

// SETTINGS
export async function updateSettings(patch: Partial<SiteSettings>) {
  await requireAuth();
  await fetchJson("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ patch }) });
}

// PROGRAMS
export async function adminListPrograms(): Promise<Program[]> {
  await requireAuth();
  const d = await fetchJson<{ items: Program[] }>("/api/admin/programs", { method: "GET" });
  return d.items || [];
}

export async function upsertProgram(p: Partial<Program> & { title: string; slug: string }) {
  await requireAuth();
  await fetchJson("/api/admin/programs", { method: "POST", body: JSON.stringify({ item: p }) });
}

export async function deleteProgram(id: string) {
  await requireAuth();
  await fetchJson(`/api/admin/programs?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

// EVENTS
export async function adminListEvents(): Promise<Event[]> {
  await requireAuth();
  const d = await fetchJson<{ items: Event[] }>("/api/admin/events", { method: "GET" });
  return d.items || [];
}

export async function upsertEvent(e: Partial<Event> & { title: string; slug: string }) {
  await requireAuth();
  await fetchJson("/api/admin/events", { method: "POST", body: JSON.stringify({ item: e }) });
}

export async function deleteEvent(id: string) {
  await requireAuth();
  await fetchJson(`/api/admin/events?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

// POSTS
export async function adminListPosts(): Promise<Post[]> {
  await requireAuth();
  const d = await fetchJson<{ items: Post[] }>("/api/admin/posts", { method: "GET" });
  return d.items || [];
}

export async function upsertPost(p: Partial<Post> & { title: string; slug: string }) {
  await requireAuth();
  await fetchJson("/api/admin/posts", { method: "POST", body: JSON.stringify({ item: p }) });
}

export async function deletePost(id: string) {
  await requireAuth();
  await fetchJson(`/api/admin/posts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

// GALLERY
export async function adminListGallery(): Promise<GalleryItem[]> {
  await requireAuth();
  const d = await fetchJson<{ items: GalleryItem[] }>("/api/admin/gallery", { method: "GET" });
  return d.items || [];
}

export async function upsertGalleryItem(g: Partial<GalleryItem> & { image_url: string }) {
  await requireAuth();
  await fetchJson("/api/admin/gallery", { method: "POST", body: JSON.stringify({ item: g }) });
}

export async function deleteGalleryItem(id: string) {
  await requireAuth();
  await fetchJson(`/api/admin/gallery?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

// TEAM
export async function adminListTeam(): Promise<TeamMember[]> {
  await requireAuth();
  const d = await fetchJson<{ items: TeamMember[] }>("/api/admin/team", { method: "GET" });
  return d.items || [];
}

export async function upsertTeamMember(t: Partial<TeamMember> & { name: string }) {
  await requireAuth();
  await fetchJson("/api/admin/team", { method: "POST", body: JSON.stringify({ item: t }) });
}

export async function deleteTeamMember(id: string) {
  await requireAuth();
  await fetchJson(`/api/admin/team?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

// COMMENTS (ADMIN)
export async function adminListPostComments(postId: string) {
  await requireAuth();
  const d = await fetchJson<{ items: any[] }>(`/api/admin/post-comments?postId=${encodeURIComponent(postId)}`, {
    method: "GET",
  });
  return d.items || [];
}

export async function adminDeletePostComment(commentId: string) {
  await requireAuth();
  await fetchJson(`/api/admin/post-comments?id=${encodeURIComponent(commentId)}`, { method: "DELETE" });
}

// ADMIN MANAGEMENT
export async function adminCreateAdmin(params: { name: string; email: string; password: string }) {
  await requireAuth();
  await fetchJson(`/api/admin/admins`, { method: "POST", body: JSON.stringify(params) });
}

export async function adminListAdmins() {
  await requireAuth();
  const d = await fetchJson<{ items: any[] }>(`/api/admin/admins`, { method: "GET" });
  return d.items || [];
}
