"use client";

import { Lock } from "lucide-react";
import { useCallback, useLayoutEffect, useRef } from "react";
import { BadgeGlow } from "@/components/ui/badge-glow";
import type { MeProfile } from "@/features/auth/types/me";
import { SectionTickerHeading } from "@/components/ui/section-ticker-heading";
import {
  PLAYER_CLASS_FALLBACK,
  type PlayerClassMeta,
  resolvePlayerClass,
} from "@/features/developer/lib/player-class";
import { usePlayerClasses } from "@/features/developer/api/use-player-classes";
import { cn } from "@/lib/utils";

type Props = {
  profile: MeProfile;
};

type NodeState = "cleared" | "current" | "locked";

export function RankProgression({ profile }: Props) {
  const { data: playerClasses } = usePlayerClasses();
  const classes = playerClasses ?? [PLAYER_CLASS_FALLBACK];
  const current = resolvePlayerClass(profile.player_class.name, classes);
  const percentInCurrent = Math.max(
    0,
    Math.min(100, profile.xp_progress.percent),
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const n = classes.length;
  // Progress along spine from tier 1 -> tier n (n−1 segments), matched to XP %
  const p = Math.min(
    1,
    Math.max(
      0,
      (current.tier - 1 + percentInCurrent / 100) / Math.max(1, n - 1),
    ),
  );

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.42, 420);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  /** Center the user's current rank in the rail */
  useLayoutEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;

    let alive = true;

    const centerCurrentRank = () => {
      if (!alive) return;
      const li = sc.querySelector<HTMLLIElement>('[data-current-rank="true"]');
      if (!li) return;
      const scRect = sc.getBoundingClientRect();
      const liRect = li.getBoundingClientRect();
      const delta =
        liRect.left + liRect.width / 2 - (scRect.left + scRect.width / 2);
      sc.scrollTo({
        left: Math.max(0, sc.scrollLeft + delta),
        behavior: "auto",
      });
    };

    requestAnimationFrame(centerCurrentRank);

    return () => {
      alive = false;
    };
  }, [current.tier, profile.id]);

  return (
    <section
      className="anim-reveal-up mt-12 pb-8 sm:mt-16 sm:pb-10 lg:mt-20 lg:pb-12"
      style={{ animationDelay: "120ms" }}
      aria-labelledby="ranks-heading"
    >
      <header className="mx-auto mb-6 flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-3 px-4 pb-5 sm:px-6 lg:px-8">
        <SectionTickerHeading
          id="ranks-heading"
          title="ranks"
          prefix="#"
          meta={`${current.tier}/${n}`}
        />
      </header>

      <div className="relative w-full">
        <div className="border-y border-white/[0.07] bg-background/95">
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-background via-background/90 to-transparent sm:w-20"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-background via-background/90 to-transparent sm:w-20"
            />

            <div
              ref={scrollRef}
              role="region"
              aria-label="Rank progression, scroll horizontally"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  scrollByDir(-1);
                }
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  scrollByDir(1);
                }
              }}
              className={cn(
                "rank-rail-scroll overflow-x-auto overflow-y-visible scroll-smooth outline-none focus-visible:ring-2 focus-visible:ring-hi/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "scroll-ps-6 scroll-pe-6 sm:scroll-ps-10 sm:scroll-pe-10 md:scroll-ps-14 md:scroll-pe-14",
              )}
            >
              <div className="px-6 py-24 sm:px-10 md:px-14">
                <div
                  className="rank-rail-row relative min-w-max"
                  style={{ "--rank-n": n } as React.CSSProperties}
                >
                  {/* Spine connecting ranks; filled to progress */}
                  <div
                    aria-hidden="true"
                    className="rank-spine pointer-events-none absolute top-[2.875rem] z-0 h-px sm:top-[3.375rem]"
                  >
                    <div className="absolute inset-0 bg-white/[0.1]" />
                    <div
                      className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
                      style={{
                        width: `${p * 100}%`,
                        background:
                          "linear-gradient(90deg, oklch(0.52 0.20 282) 0%, oklch(0.72 0.19 288) 100%)",
                        boxShadow: "0 0 10px oklch(0.72 0.19 288 / 0.4)",
                      }}
                    />
                  </div>

                  <ol className="relative z-10 flex min-w-max flex-nowrap items-start gap-[var(--rank-gap)]">
                    {classes.map((rank) => {
                      const state: NodeState =
                        rank.tier < current.tier
                          ? "cleared"
                          : rank.tier === current.tier
                            ? "current"
                            : "locked";
                      return (
                        <RankNode
                          key={rank.slug}
                          rank={rank}
                          state={state}
                          playerLevel={profile.xp_progress.level}
                        />
                      );
                    })}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RankNode({
  rank,
  state,
  playerLevel,
}: {
  rank: PlayerClassMeta;
  state: NodeState;
  playerLevel: number;
}) {
  const locked = state === "locked";
  const levelLabel =
    state === "current"
      ? `LVL ${playerLevel}`
      : `LVL ${String(rank.requiredLevel).padStart(2, "0")}`;

  return (
    <li
      data-current-rank={state === "current" ? "true" : undefined}
      className={cn(
        "relative flex snap-center snap-always flex-col items-center gap-3",
        "min-w-[8.25rem] flex-1 px-1 sm:min-w-[9.5rem] sm:px-1.5 md:min-w-[11rem] lg:min-w-[12.5rem]",
      )}
    >

      <div
        className={cn(
          "relative z-10 flex w-full items-center justify-center transition-all duration-500 py-1",
          state === "current" && "scale-[1.12] sm:scale-[1.15]",
        )}
      >
        <div
          className="relative flex h-[5.25rem] w-[5.25rem] items-center justify-center sm:h-[6.25rem] sm:w-[6.25rem]"
          style={
            state === "current"
              ? { animation: "badge-breathe 3.2s ease-in-out infinite" }
              : undefined
          }
        >
          <BadgeGlow
            src={rank.badge}
            alt={`${rank.name} rank`}
            width={180}
            height={180}
            intensity="subtle"
            disabled={state !== "current"}
            className="h-full w-full"
            imageClassName={cn(locked && "rank-badge-locked")}
          />

          {/* Locked overlays */}
          {locked && (
            <>
              <div
                className="rank-locked-overlay pointer-events-none absolute inset-0 z-20 mix-blend-multiply"
                aria-hidden="true"
              />

              <div
                className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-zinc-950/35 via-transparent to-zinc-950/25"
                aria-hidden="true"
              />
              <Lock
                className="absolute bottom-0 right-0 z-30 size-3.5 text-zinc-300 opacity-90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]"
                strokeWidth={2}
                aria-label="Locked rank"
              />
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <span
          className={cn(
            "ticker text-center text-sm uppercase tracking-[0.22em]",
            state === "current" && "text-hi",
            state === "cleared" && "text-zinc-200",
            locked && "text-zinc-500",
          )}
        >
          {rank.name}
        </span>
        <span
          className={cn(
            "ticker text-sm tracking-[0.2em]",
            locked ? "text-zinc-700" : "text-zinc-600",
          )}
        >
          {levelLabel}
        </span>
        {locked && (
          <span className="ticker mt-0.5 text-xs uppercase tracking-[0.28em] text-muted-foreground/50">
            locked
          </span>
        )}
      </div>
    </li>
  );
}
