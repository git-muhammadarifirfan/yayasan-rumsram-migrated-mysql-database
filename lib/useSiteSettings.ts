"use client";

/**
 * Client-side Site Settings cache + hook.
 *
 * Tujuan:
 * - Menghindari fetch settings berulang di banyak page.
 * - Mengurangi flicker (logo/nama/CTA berubah setelah load).
 * - Dedupe request: jika beberapa komponen minta settings bersamaan, tetap 1 request.
 *
 * Catatan:
 * - Cache ini hanya in-memory (tidak ke localStorage) agar sederhana.
 * - Cache reset ketika user reload halaman/tab.
 */

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { getSettings } from "@/lib/apiPublic";

// In-memory cache (bertahan selama tab berjalan)
let cache: SiteSettings | null | undefined = undefined; // undefined = belum load
let inFlight: Promise<SiteSettings | null> | null = null;
const subscribers = new Set<(value: SiteSettings | null | undefined) => void>();

function notify() {
  for (const fn of subscribers) fn(cache);
}

async function loadOnce(): Promise<SiteSettings | null> {
  // Sudah ada cache (success / failure)
  if (cache !== undefined) return cache;

  // Masih ada request yang berjalan
  if (inFlight) return inFlight;

  // Mulai request
  inFlight = getSettings()
    .then((s) => {
      cache = s;
      notify();
      return s;
    })
    .catch((err) => {
      // Jangan crash UI, fallback ke null
      console.warn("[useSiteSettings] getSettings failed:", err);
      cache = null;
      notify();
      return null;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/**
 * Optional helper untuk memaksa reload settings.
 */
export async function refreshSiteSettings(): Promise<SiteSettings | null> {
  cache = undefined;
  notify();
  return loadOnce();
}

export function useSiteSettings() {
  // state awal ambil dari cache in-memory
  const [raw, setRaw] = useState<SiteSettings | null | undefined>(cache);

  // undefined = loading, null = gagal atau data kosong
  const loading = raw === undefined;

  useEffect(() => {
    const sub = (value: SiteSettings | null | undefined) => setRaw(value);
    subscribers.add(sub);

    // Trigger load saat pertama kali dipakai
    if (cache === undefined) void loadOnce();

    return () => {
      subscribers.delete(sub);
    };
  }, []);

  return {
    settings: raw ?? null,
    loading,
    refresh: refreshSiteSettings,
  };
}
