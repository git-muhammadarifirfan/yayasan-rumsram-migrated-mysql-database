"use client";

import { useEffect } from "react";
import { getSession } from "@/lib/auth";

export default function AdminRoot() {
  useEffect(() => {
    getSession().then((s) => {
      if (s) location.href = "/admin/dashboard/";
      else location.href = "/admin/login/";
    });
  }, []);
  return <div className="min-h-screen grid place-items-center text-sm text-muted">Loading…</div>;
}
