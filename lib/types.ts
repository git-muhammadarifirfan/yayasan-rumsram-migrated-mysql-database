export type Role = "admin" | "editor" | "viewer";

export type SiteSettings = {
  id: number;
  org_name: string;
  tagline: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  donation_cta_label: string | null;
  donation_link: string | null;
  about_short: string | null;
  about_long: string | null;
  vision: string | null;
  mission_items: string[] | null;
  values_items: string[] | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  social: any | null;
  logo_url: string | null;
  hero_image_url: string | null;
};

export type Program = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string | null;
  cover_url: string | null;
  gallery_urls: string[] | null;
  status: "draft" | "published";
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string | null;
  event_date: string | null;
  location: string | null;
  cover_url: string | null;
  status: "draft" | "published";
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string | null;
  cover_url: string | null;
  status: "draft" | "published";
  published_at: string | null; // date string
  category?: string | null;
  author_id?: string | null;
  author_email?: string | null;
  // derived field (computed in app via RPC)
  comment_count?: number | null;
  created_at: string;
  updated_at: string;
};
export type PostComment = {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  created_at: string;
};

export type GalleryUnifiedItem = {
  id: string;
  title: string | null;
  category: string | null;
  image_url: string;
  href?: string | null;
  created_at?: string | null;
  source?: "custom" | "program" | "event" | "blog";
  sort_order?: number | null;
};



export type GalleryItem = {
  id: string;
  title: string | null;
  category: string | null;
  image_url: string;
  sort_order: number | null;
  created_at: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role_title: string | null;
  bio: string | null;
  photo_url: string | null;
  sort_order: number | null;
  created_at: string;
};
