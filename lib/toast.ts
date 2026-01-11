export type ToastKind = "success" | "error" | "info";

export type ToastPayload = {
  id?: string;
  kind: ToastKind;
  message: string;
  description?: string;
  durationMs?: number;
};

export const TOAST_EVENT_NAME = "rumsram:toast";

function emit(payload: ToastPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT_NAME, { detail: payload }));
}

type ToastOptions = Omit<ToastPayload, "kind" | "message">;

export const toast = {
  success(message: string, opts?: ToastOptions) {
    emit({ kind: "success", message, ...opts });
  },
  error(message: string, opts?: ToastOptions) {
    emit({ kind: "error", message, ...opts });
  },
  info(message: string, opts?: ToastOptions) {
    emit({ kind: "info", message, ...opts });
  },
  show(payload: ToastPayload) {
    emit(payload);
  },
};
