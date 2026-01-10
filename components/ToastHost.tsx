"use client";

import { useEffect, useMemo, useState } from "react";
import { TOAST_EVENT_NAME, type ToastKind, type ToastPayload } from "@/lib/toast";

type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
  description?: string;
  durationMs: number;
};

function glyph(kind: ToastKind) {
  if (kind === "success") return "✓";
  if (kind === "error") return "×";
  return "i";
}

function iconClass(kind: ToastKind) {
  switch (kind) {
    case "success":
      return "bg-teal-500/10 text-teal-700 border-teal-600/20";
    case "error":
      return "bg-brand-500/10 text-brand-700 border-brand-600/20";
    case "info":
    default:
      return "bg-black/5 text-slate border-black/10";
  }
}

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(ev: Event) {
      const detail = (ev as CustomEvent<ToastPayload>).detail;
      if (!detail || !detail.message) return;

      const id =
        detail.id ||
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? (crypto as any).randomUUID()
          : String(Date.now()) + Math.random().toString(16).slice(2));

      const item: ToastItem = {
        id,
        kind: detail.kind,
        message: detail.message,
        description: detail.description,
        durationMs: detail.durationMs ?? (detail.kind === "error" ? 4200 : 2800),
      };

      setToasts((prev) => [item, ...prev].slice(0, 5));

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, item.durationMs);
    }

    window.addEventListener(TOAST_EVENT_NAME, onToast as any);
    return () => window.removeEventListener(TOAST_EVENT_NAME, onToast as any);
  }, []);

  const isEmpty = useMemo(() => toasts.length === 0, [toasts]);
  if (isEmpty) return null;

  return (
    <div className="fixed right-4 top-4 z-[9999] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="toast-in card p-3">
          <div className="flex gap-3">
            <div className={`mt-0.5 grid h-9 w-9 place-items-center rounded-xl border text-sm font-semibold ${iconClass(t.kind)}`}>
              {glyph(t.kind)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{t.message}</div>
                  {t.description ? (
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted">{t.description}</div>
                  ) : null}
                </div>
                <button
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-black/5"
                  onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                  aria-label="Close"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
