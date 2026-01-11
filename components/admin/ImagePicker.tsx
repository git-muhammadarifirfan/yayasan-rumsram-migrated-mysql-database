"use client";

import { useState } from "react";
import { uploadImage } from "@/lib/upload";
import { toast } from "@/lib/toast";

export function ImagePicker({
  label,
  value,
  onChange,
  folder = "uploads",
}: {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"file" | "link">("file");
  const [link, setLink] = useState(value ?? "");

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{label}</div>
        <div className="flex gap-2">
          <button
            className={"btn " + (mode === "file" ? "btn-primary" : "btn-ghost")}
            type="button"
            onClick={() => setMode("file")}
          >
            Upload
          </button>
          <button
            className={"btn " + (mode === "link" ? "btn-primary" : "btn-ghost")}
            type="button"
            onClick={() => setMode("link")}
          >
            Link
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div className="grid gap-2">
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              try {
                const url = await uploadImage(f, folder);
                onChange(url);
                setLink(url);
                toast.success("Image uploaded");
              } catch (err: any) {
                toast.error("Upload failed", {
                  description: err?.message || "Unknown error",
                });
              } finally {
                // reset input so same file can be re-uploaded
                (e.target as HTMLInputElement).value = "";
                setBusy(false);
              }
            }}
          />
          <div className="text-xs text-muted">
            Gambar akan di-upload apa adanya (tanpa konversi). Frontend sudah lazy-load + skeleton.
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          <input
            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
            placeholder="https://example.com/image.jpg"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              const v = link.trim();
              onChange(v);
              toast.success("Link saved");
            }}
          >
            Save link
          </button>
        </div>
      )}

      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="preview"
          className="mt-2 h-40 w-full rounded-2xl object-cover border border-black/5"
          loading="lazy"
        />
      ) : (
        <div className="mt-2 rounded-2xl border border-dashed border-black/10 p-6 text-sm text-muted">
          No image selected
        </div>
      )}
    </div>
  );
}
