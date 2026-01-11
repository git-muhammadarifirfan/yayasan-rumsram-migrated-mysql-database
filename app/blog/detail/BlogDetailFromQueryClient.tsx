"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import BlogDetailClient from "../_slug_disabled/BlogDetailClient"; // atau sesuaikan path kalau beda

export default function BlogDetailFromQueryPage() {
  const sp = useSearchParams();
  const slug = useMemo(() => sp.get("slug") || "", [sp]);

  // Kalau slug kosong, tampilkan fallback (biar gak blank)
  if (!slug) {
    return (
      <div className="container-xl py-14">
        <div className="card p-8">
          <div className="text-base font-semibold">Artikel tidak ditemukan</div>
          <p className="mt-2 text-sm text-muted">
            Buka dari halaman Blog lalu pilih artikel.
          </p>
        </div>
      </div>
    );
  }

  return <BlogDetailClient slug={slug} />;
}
