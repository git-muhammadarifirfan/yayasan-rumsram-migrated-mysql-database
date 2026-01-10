import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { requireEditor } from "@/lib/server/auth";

export const runtime = "nodejs";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  try {
    // only admin/editor can upload
    await requireEditor();

    const form = await req.formData();
    const folder = String(form.get("folder") || "uploads").trim() || "uploads";
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name || "") || ".webp";

    // Special requirement: logo should come from database.
    // We return a data URL; the admin settings will save it into MySQL.
    if (folder === "logo") {
      const mime = file.type || "image/webp";
      const b64 = buf.toString("base64");
      const url = `data:${mime};base64,${b64}`;
      return NextResponse.json({ url });
    }

    const base = safeName(path.basename(file.name || "upload"));
    const fname = `${Date.now()}-${Math.random().toString(16).slice(2)}-${base.replace(ext, "")}${ext}`;
    const relDir = path.join("uploads", folder);
    const outDir = path.join(process.cwd(), "public", relDir);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, fname), buf);

    const url = `/${relDir.replace(/\\/g, "/")}/${fname}`;
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
}
