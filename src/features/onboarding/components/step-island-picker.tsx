"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { BadgeGlow } from "@/components/ui/badge-glow";
import { useMe } from "@/features/auth/api/use-me";
import { useIslands } from "../api/use-islands";
import {
  getIslandImagePath,
  preloadIslandImage,
} from "../lib/island-image";

const LEAVE_MS = 280;

/**
 * Tracks which island to display (entering) and which one is leaving.
 * Two separate CSS keyframe animations avoid any transition direction reversal
 * when the user switches mid-animation.
 */
function useSequentialReveal(target: string | null) {
  const [shown, setShown] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (target === prevTargetRef.current) return;
    const prev = prevTargetRef.current;
    prevTargetRef.current = target;

    if (prev) {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      setLeaving(prev);
      leaveTimerRef.current = setTimeout(() => setLeaving(null), LEAVE_MS);
    }

    setShown(target);
  }, [target]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  return { shown, leaving };
}

type Props = {
  onConfirm: (island: string) => void;
  isConfirming?: boolean;
};

export function StepIslandPicker({ onConfirm, isConfirming = false }: Props) {
  const me = useMe();
  const { data: islands = [], isLoading } = useIslands();

  const [userSelected, setUserSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [loadedSlugs, setLoadedSlugs] = useState<Set<string>>(new Set());

  // Debounce clearing the hover state so moving between pills (across the gap)
  // doesn't briefly set hovered=null and trigger a spurious leave animation.
  const hoverClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter(value: string) {
    if (hoverClearTimer.current) {
      clearTimeout(hoverClearTimer.current);
      hoverClearTimer.current = null;
    }
    void preloadIslandImage(value).then(() => {
      setLoadedSlugs((prev) => new Set([...prev, value]));
    });
    setHovered(value);
  }

  function handleMouseLeave() {
    hoverClearTimer.current = setTimeout(() => {
      setHovered(null);
    }, 60);
  }

  const selected = userSelected ?? me.data?.island ?? null;
  const displayIsland = hovered ?? selected;
  // Only animate once the image is actually in the browser cache.
  const readyIsland =
    displayIsland && loadedSlugs.has(displayIsland) ? displayIsland : null;

  const { shown, leaving } = useSequentialReveal(readyIsland);

  useEffect(() => {
    return () => {
      if (hoverClearTimer.current) clearTimeout(hoverClearTimer.current);
    };
  }, []);

  // Preload island images in parallel, wait for decode so hover never shows partial frames.
  useEffect(() => {
    if (!islands.length) return;

    let cancelled = false;
    const preloadLinks: HTMLLinkElement[] = [];

    islands.forEach((island) => {
      const href = getIslandImagePath(island.value);
      if (!href) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      preloadLinks.push(link);

      void preloadIslandImage(island.value)
        .then(() => {
          if (cancelled) return;
          setLoadedSlugs((prev) => new Set([...prev, island.value]));
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
      preloadLinks.forEach((link) => link.remove());
    };
  }, [islands]);

  function handleSelect(value: string) {
    setUserSelected(value);
  }

  return (
    <div className="flex flex-1 flex-col anim-reveal-up">
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="ticker text-xs uppercase tracking-[0.28em] text-hi">
            {"// select island"}
          </span>
          <h2 className="text-[clamp(1.75rem,4.5vw,2.75rem)] font-semibold leading-tight tracking-tight">
            Where do you ship?
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick your primary domain. You can always change it later.
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-24 animate-pulse bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="flex max-w-2xl flex-wrap justify-center gap-2">
            {islands.map((island) => (
              <button
                key={island.value}
                onClick={() => handleSelect(island.value)}
                onMouseEnter={() => handleMouseEnter(island.value)}
                onMouseLeave={handleMouseLeave}
                className={cn(
                  "border px-4 py-1.5 text-sm font-medium transition-all duration-150",
                  selected === island.value
                    ? "border-hi bg-hi/10 text-foreground"
                    : "border-white/[0.12] text-muted-foreground hover:border-white/30 hover:text-foreground",
                )}
              >
                {island.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom zone: island bleeds off the bottom-left corner, button anchors at bottom-right */}
      <div className="relative flex-1 min-h-64 sm:min-h-80">
        {/* Island — oversized, translated off the left and bottom edges */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-[20rem] w-[20rem] translate-y-20 -translate-x-16 sm:h-[32rem] sm:w-[32rem] sm:translate-y-24 sm:-translate-x-20">
          {/* Keep decoded bitmaps warm — same static URL as BadgeGlow with unoptimized */}
          <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
            {islands
              .filter((island) => loadedSlugs.has(island.value))
              .map((island) => {
                const src = getIslandImagePath(island.value);
                if (!src) return null;
                return (
                  <img
                    key={`warm-${island.value}`}
                    src={src}
                    alt=""
                    decoding="async"
                  />
                );
              })}
          </div>

          {leaving && (
            <div
              key={`leave-${leaving}`}
              className="absolute inset-0 island-picker-leave"
            >
              <BadgeGlow
                src={getIslandImagePath(leaving)!}
                alt={leaving}
                width={480}
                height={480}
                unoptimized
                intensity="strong"
                className="h-full w-full"
              />
            </div>
          )}
          {shown && (
            <div
              key={shown}
              className="absolute inset-0 island-picker-enter"
            >
              <BadgeGlow
                src={getIslandImagePath(shown)!}
                alt={shown}
                width={480}
                height={480}
                unoptimized
                priority
                intensity="strong"
                className="h-full w-full"
              />
            </div>
          )}
        </div>

        {/* Continue button — bottom-right */}
        <button
          disabled={!selected || isConfirming}
          onClick={() => selected && onConfirm(selected)}
          className={cn(
            buttonVariants({ variant: "default" }),
            "absolute right-8 bottom-8 h-9 px-5 text-sm transition-opacity",
            (!selected || isConfirming) && "opacity-40",
          )}
        >
          {isConfirming ? "Loading…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
