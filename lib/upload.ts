/**
 * Image upload:
 * - client-side optimize (resize + compress)
 * - convert to WebP
 * - upload to our Next.js API (stored locally, or as base64 for logo)
 */

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function fileToWebp(file: File, opts?: { maxW?: number; maxH?: number; quality?: number }) {
  const maxW = opts?.maxW ?? 1600;
  const maxH = opts?.maxH ?? 1600;
  const quality = opts?.quality ?? 0.82;

  if (!file.type?.startsWith("image/")) return file;

  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return file; // fallback for unsupported formats (e.g., HEIC)
  }

  const w = bmp.width;
  const h = bmp.height;
  const scale = Math.min(1, maxW / w, maxH / h);
  const tw = Math.max(1, Math.round(w * scale));
  const th = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, tw, th);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", quality)
  );

  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type: "image/webp" });
}

export async function uploadImage(file: File, folder = "uploads") {
  const optimized = await fileToWebp(file);
  const fd = new FormData();
  fd.append("folder", folder);
  fd.append("file", optimized, `${uid()}-${optimized.name}`);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: fd,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Upload failed (${res.status})`);
  return data.url as string;
}

// Backward-compatible alias
export async function uploadImageWebp(file: File, folder = "uploads") {
  return uploadImage(file, folder);
}
