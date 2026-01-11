"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

export function SmartImage({
  src,
  alt,
  className,
  ratio = "16/10",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  ratio?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  const showFallback = !src || src.trim() === "";
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl border border-black/5 bg-black/[0.02]", className)}
      style={{ aspectRatio: ratio as any }}
    >
      {!loaded && <Skeleton className="absolute inset-0" />}
      {showFallback ? (
        <div className="absolute inset-0 grid place-items-center text-sm text-muted">
          No image
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
