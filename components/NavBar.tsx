"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HeartHandshake, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/programs/", label: "Programs" },
  { href: "/events/", label: "Events" },
  { href: "/gallery/", label: "Gallery" },
  { href: "/blog/", label: "Blog" },
  { href: "/contact/", label: "Contact" },
];

export function NavBar({
  donateHref = "/donate/",
  donateLabel = "Donate",
  logoUrl,
  orgName,
}: {
  donateHref?: string;
  donateLabel?: string;
  logoUrl?: string | null;
  orgName?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const active = useMemo(() => (href: string) => pathname === href, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur">
      <div className="container-xl flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-black text-white overflow-hidden">
            {logoUrl ? (
              // Logo dari database (data URL / URL)
              <img src={logoUrl} alt="Logo" className="h-full w-full object-contain bg-white" />
            ) : (
              <HeartHandshake size={18} />
            )}
          </span>
          <span className="leading-none">
            <span className="block text-[15px] text-slate">{orgName?.split(" ")[0] || "Yayasan"}</span>
            <span className="block text-[15px] text-slate">{orgName?.split(" ").slice(1).join(" ") || "Rumsram"}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-semibold text-slate hover:bg-black/5",
                active(i.href) && "bg-black/5"
              )}
            >
              {i.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href={donateHref} className="btn btn-primary">
            Donasi
          </Link>
          {/* <Link href="/admin/" className="btn btn-ghost">
            Admin
          </Link> */}
        </div>

        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/5"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-white md:hidden">
          <div className="container-xl flex flex-col gap-1 py-3">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-semibold text-slate hover:bg-black/5",
                  active(i.href) && "bg-black/5"
                )}
              >
                {i.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link href={donateHref} className="btn btn-primary w-full">
                {donateLabel}
              </Link>
              <Link href="/admin/" className="btn btn-ghost w-full">
                Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
