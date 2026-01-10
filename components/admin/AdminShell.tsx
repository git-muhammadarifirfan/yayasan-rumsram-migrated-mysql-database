"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";

const nav = [
  { href: "/admin/dashboard/", label: "Dashboard" },
  { href: "/admin/dashboard/settings/", label: "Settings" },
  { href: "/admin/dashboard/programs/", label: "Programs" },
  { href: "/admin/dashboard/events/", label: "Events" },
  { href: "/admin/dashboard/blog/", label: "Blog" },
  { href: "/admin/dashboard/gallery/", label: "Gallery" },
  { href: "/admin/dashboard/team/", label: "Team" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="container-xl flex h-16 items-center justify-between">
          <Link href="/admin/dashboard/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-black/5">R</span>
            <span>Rumsram Admin</span>
          </Link>

          <div className="flex items-center gap-2">
            <a
              className="btn btn-ghost"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              Preview
            </a>
            <button
              className="btn btn-ghost"
              onClick={async () => {
                await signOut();
                location.href = "/admin/login/";
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container-xl py-6">
        {/* Mobile nav */}
        <div className="mb-4 md:hidden">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold",
                  pathname === i.href
                    ? "border-black/10 bg-white"
                    : "border-transparent bg-black/5 hover:bg-black/10"
                )}
              >
                {i.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className="hidden md:block">
            <div className="card sticky top-[88px] p-3">
              <div className="px-2 py-2 text-xs font-semibold text-muted">CMS MENU</div>
              <nav className="grid gap-1">
                {nav.map((i) => (
                  <Link
                    key={i.href}
                    href={i.href}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-semibold hover:bg-black/5",
                      pathname === i.href && "bg-black/5"
                    )}
                  >
                    {i.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <main className="card p-5 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
