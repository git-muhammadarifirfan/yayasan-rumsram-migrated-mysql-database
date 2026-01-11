"use client";

import { useState } from "react";
import { signIn, getMyRole } from "@/lib/auth";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="min-h-screen gradient-bg grid place-items-center px-4">
      <div className="card w-full max-w-md p-7">
        <div className="text-2xl font-semibold">Admin Login</div>
        <p className="mt-2 text-sm text-muted">
          Login menggunakan akun yang sudah terdaftar
        </p>

        <div className="mt-6 grid gap-3">
          <input
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}

          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={async () => {
              setErr(null);
              setBusy(true);
              try {
                await signIn(email.trim(), password);
                const role = await getMyRole();
                if (role !== "admin" && role !== "editor") {
                  setErr("Akun ini belum punya role admin/editor.");
                  return;
                }
                location.href = "/admin/dashboard/";
              } catch (e: any) {
                setErr(e?.message || "Login failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <Link href="/" className="btn btn-ghost">Back to site</Link>
        </div>
      </div>
    </div>
  );
}
