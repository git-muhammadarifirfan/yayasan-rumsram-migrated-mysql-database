"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * CenterModal (Portal)
 *
 * Kenapa pakai Portal?
 * - Banyak komponen animasi (mis. SectionReveal) memakai `transform`.
 *   `position: fixed` di dalam parent yang punya `transform` bisa jadi
 *   berperilaku seperti "fixed relatif ke parent", bukan ke viewport.
 * - Dengan Portal ke `document.body`, modal SELALU menutup 1 layar penuh
 *   (termasuk navbar & footer) dan selalu center.
 *
 * Behavior:
 * - Klik area backdrop -> close
 * - Klik konten -> tidak close
 */
export function CenterModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
      onMouseDown={(e) => {
        // Close hanya jika klik di backdrop (wrapper), bukan di dalam konten
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop full-screen: menutup navbar, footer, dan seluruh halaman */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative w-full max-w-3xl">{children}</div>
    </div>,
    document.body
  );
}
