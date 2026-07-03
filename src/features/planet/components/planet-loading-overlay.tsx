"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const FADE_MS = 700;

type Props = {
  isLoading: boolean;
};

export function PlanetLoadingOverlay({ isLoading }: Props) {
  const [mounted, setMounted] = useState(isLoading);
  const [exiting, setExiting] = useState(false);

  if (isLoading) {
    if (!mounted) setMounted(true);
    if (exiting) setExiting(false);
  } else if (mounted && !exiting) {
    setExiting(true);
  }

  useEffect(() => {
    if (!exiting) return;

    const timer = window.setTimeout(() => {
      setMounted(false);
      setExiting(false);
    }, FADE_MS);

    return () => window.clearTimeout(timer);
  }, [exiting]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center bg-zinc-950 transition-opacity ease-out",
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      role="status"
      aria-live="polite"
      aria-hidden={exiting}
    >
      <div className="anim-reveal-in flex flex-col items-center gap-4">
        <div className="relative h-9 w-9" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border border-white/[0.08]" />
          <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-hi/40 [animation-duration:1.4s]" />
          <span className="absolute inset-[11px] rounded-full bg-hi/70 shadow-[0_0_12px_var(--hi)]" />
        </div>
        <p className="ticker text-xs uppercase tracking-[0.28em] text-zinc-500">
          loading the dev world
        </p>
      </div>
    </div>
  );
}
