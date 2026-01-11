import Link from "next/link";
import { Github, Instagram, Linkedin, X } from "lucide-react";
import { Skeleton } from "./Skeleton";
import type { SiteSettings } from "@/lib/types";

type Props = {
  settings?: SiteSettings | null;
};

function safeSocial(s: any) {
  if (!s || typeof s !== "object") return {};
  return s as Record<string, string>;
}

export function Footer({ settings }: Props) {
  const year = new Date().getFullYear();

  const nav = [
    { href: "/about/", label: "About" },
    { href: "/programs/", label: "Programs" },
    { href: "/events/", label: "Events" },
    { href: "/gallery/", label: "Gallery" },
    { href: "/blog/", label: "Blog" },
    { href: "/contact/", label: "Contact" },
  ];

  const orgName = settings?.org_name?.trim() || "";
  const footerText = (settings?.tagline || settings?.about_short || "").trim() || null;

  const social = safeSocial(settings?.social);
  const xHref = social.x || social.twitter || null;
  const igHref = social.instagram || null;
  const liHref = social.linkedin || null;
  const ghHref = social.github || null;

  const donateHref = settings?.donation_link || "/donate/";
  const donateLabel = settings?.donation_cta_label || null;

  const email = settings?.email?.trim() || null;
  const address = settings?.address?.trim() || null;

  const BrandIcon = () => {
    if (settings === null) return <Skeleton className="h-4 w-4 rounded-md" />;
    const letter = orgName ? orgName.slice(0, 1).toUpperCase() : "•";
    return <span className="text-sm font-semibold">{letter}</span>;
  };

  const SocialIcon = ({
    href,
    label,
    children,
  }: {
    href: string | null;
    label: string;
    children: React.ReactNode;
  }) => {
    if (!href) {
      return (
        <span aria-label={label} className="text-muted/60">
          {children}
        </span>
      );
    }
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="transition-colors hover:text-black">
        {children}
      </a>
    );
  };

  return (
    <footer className="border-t border-black/5 bg-zinc-50">
      <div className="container-xl py-10">
        <div className="rounded-3xl border border-black/5 bg-white shadow-sm">
          <div className="px-7 py-10 sm:px-10">
            <div className="grid gap-10 lg:grid-cols-12">
              {/* Brand */}
              <div className="lg:col-span-5">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white">
                    <BrandIcon />
                  </div>

                  <div className="text-base font-semibold text-black">
                    {orgName ? orgName : <Skeleton className="h-5 w-44 rounded-md" />}
                  </div>
                </div>

                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                  {footerText ? (
                    footerText
                  ) : (
                    <span className="block">
                    </span>
                  )}
                </p>

                {/* Social */}
                <div className="mt-4 flex items-center gap-4 text-muted">
                  <SocialIcon href={xHref} label="X">
                    <X className="h-4 w-4" />
                  </SocialIcon>
                  <SocialIcon href={igHref} label="Instagram">
                    <Instagram className="h-4 w-4" />
                  </SocialIcon>
                  <SocialIcon href={liHref} label="LinkedIn">
                    <Linkedin className="h-4 w-4" />
                  </SocialIcon>
                  <SocialIcon href={ghHref} label="GitHub">
                    <Github className="h-4 w-4" />
                  </SocialIcon>
                </div>
              </div>

              {/* Columns */}
              <div className="lg:col-span-7">
                <div className="grid gap-8 sm:grid-cols-3">
                  {/* Pages */}
                  <div>
                    <div className="text-xs font-semibold tracking-wide text-black">Pages</div>
                    <ul className="mt-3 space-y-2 text-sm text-muted">
                      {nav.map((i) => (
                        <li key={i.href}>
                          <Link href={i.href} className="transition-colors hover:text-black">
                            {i.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Get involved */}
                  <div>
                    <div className="text-xs font-semibold tracking-wide text-black">Get Involved</div>

                    <ul className="mt-4 space-y-2 text-sm text-muted">
                      <li>
                        <Link href={donateHref} className="font-semibold text-brand-700 transition-opacity hover:opacity-80">
                          {donateLabel ? donateLabel : <Skeleton className="h-4 w-24 rounded-md" />}
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact/" className="transition-colors hover:text-black">
                          Volunteer
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact/" className="transition-colors hover:text-black">
                          Partnership
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Contact */}
                  <div>
                    <div className="text-xs font-semibold tracking-wide text-black">Contact</div>
                    <ul className="mt-3 space-y-2 text-sm text-muted">
                      <li>
                        {email ? (
                          <a className="transition-colors hover:text-black" href={`mailto:${email}`}>
                            {email}
                          </a>
                        ) : (
                          <Skeleton className="h-4 w-36 rounded-md" />
                        )}
                      </li>
                      <li>{address ? <span className="whitespace-pre-line">{address}</span> : <Skeleton className="h-4 w-28 rounded-md" />}</li>
                      <li>
                        <Link href="/contact/" className="transition-colors hover:text-black">
                          Contact form
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-10 flex flex-col gap-3 border-t border-black/5 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
              <div>
                © {year} {orgName ? orgName : <span className="inline-block align-middle"><Skeleton className="h-4 w-32 rounded-md" /></span>}. All rights reserved.
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Link href="/privacy/" className="hover:text-black hover:underline">
                  Privacy Policy
                </Link>
                <Link href="/terms/" className="hover:text-black hover:underline">
                  Terms of Service
                </Link>
                <Link href="/cookies/" className="hover:text-black hover:underline">
                  Cookies Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
