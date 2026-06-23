"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Hexagon } from "lucide-react";
import { ArrowRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BadgeGlow } from "@/components/ui/badge-glow";
import { useMe } from "@/features/auth/api/use-me";
import { formatFullNumber } from "@/features/profile/lib/format";
import { useCountUp } from "@/features/profile/lib/use-count-up";
import { createXpMath } from "../lib/xp-math";
import { useRankRevealSequence } from "../lib/use-rank-reveal-sequence";
import { useXpConfig } from "../api/use-xp-config";
import { usePlayerClasses } from "../api/use-player-classes";
import type { SyncDiffSummary } from "@/features/auth/types/sync";
import { preloadBadgeImage } from "@/features/profile/lib/player-class";


export function LevelReveal({
  startXp,
  endXp,
  onDone,
  ctaLabel = "Enter the World",
  diffSummary,
}: {
  startXp?: number;
  endXp?: number;
  onDone?: () => void;
  ctaLabel?: string;
  diffSummary?: SyncDiffSummary;
} = {}) {
  const router = useRouter();
  const { data: me } = useMe();
  const [loadedBadges, setLoadedBadges] = useState<Set<string>>(new Set());
  const xpBrut = endXp ?? me?.xp_brut ?? 0;
  const resolvedStartXp = startXp ?? 0;

  const { data: xpConfig } = useXpConfig();
  const { data: playerClasses } = usePlayerClasses();
  const xpMath = useMemo(
    () =>
      xpConfig && playerClasses
        ? createXpMath({ levelThresholds: xpConfig.levelThresholds, playerClasses })
        : null,
    [xpConfig, playerClasses],
  );

  const {
    phase,
    segmentIndex,
    segment,
    animatedXp,
    barProgress,
    finalProgress,
    isComplete,
    finalClass,
  } = useRankRevealSequence(xpBrut, xpMath, resolvedStartXp);

  const displayClass = isComplete ? finalClass : segment?.targetClass ?? finalClass;
  const isMilestoneSegment = segment?.pauseAfter ?? false;

  // Real-time level from XP algorithm
  const currentLevel = useMemo(
    () => xpMath?.getXpProgress(animatedXp).level ?? 1,
    [xpMath, animatedXp],
  );

  // Bar fill: segment-based; final segment scaled to end at user's real level %
  const isLastClassSegment = !isComplete && !isMilestoneSegment && segment !== null;
  const barFillPercent = isLastClassSegment
    ? Math.round((barProgress.percent / 100) * finalProgress.percent)
    : barProgress.percent;

  // During milestone segments, label points to the rank we're about to unlock
  const nextClass = useMemo(() => {
    if (!isMilestoneSegment || isComplete || !playerClasses) return null;
    const idx = playerClasses.findIndex((c) => c.slug === displayClass.slug);
    return playerClasses[idx + 1] ?? null;
  }, [isMilestoneSegment, isComplete, displayClass.slug, playerClasses]);

  useEffect(() => {
    playerClasses?.forEach((cls) => {
      void preloadBadgeImage(cls.badge)
        .then(() => {
          setLoadedBadges((prev) => new Set([...prev, cls.badge]));
        })
        .catch(() => {});
    });
  }, [playerClasses]);

  const showCelebrationFX = phase === "celebrating" || isComplete;

  // Animated cell count when animation completes
  const cellCount = me?.cell_count ?? 0;
  const animatedCells = useCountUp(cellCount, { duration: 1800, delay: 300, enabled: isComplete });

  const celebrating = phase === "celebrating" || isComplete;
  const showPhrase = celebrating;

  // Store phrase from previous render to avoid flash during fade-out
  const [visiblePhrase, setVisiblePhrase] = useState(displayClass.phrase);
  if (celebrating && visiblePhrase !== displayClass.phrase) {
    setVisiblePhrase(displayClass.phrase);
  }

  // Measure badge DOM position to anchor portal FX at its center
  const badgeRef = useRef<HTMLDivElement>(null);
  const [badgeCenter, setBadgeCenter] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!showCelebrationFX || !badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();
    setBadgeCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }, [showCelebrationFX]);

  // Badge entrance: celebrate slam when unlocking/complete, gentle fade on rank swap
  // Key includes isComplete flag so the final rank remounts with its celebrate animation
  const badgeKey = `badge-${displayClass.slug}-${segmentIndex}-${isComplete ? "done" : ""}`;
  const badgeAnimClass = isComplete ? "rank-unlock-slam" : "rank-badge-swap";
  const badgeStyle = isComplete
    ? { animation: "badge-breathe 3.2s ease-in-out infinite" }
    : undefined;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center anim-reveal-in">

      {/* Portal FX */}
      {showCelebrationFX && badgeCenter && typeof window !== "undefined" && createPortal(
        <div
          key={`fx-${segmentIndex}-${phase}`}
          className="pointer-events-none fixed"
          style={{ zIndex: 9999, left: badgeCenter.x, top: badgeCenter.y, transform: "translate(-50%, -50%)", width: 240, height: 240 }}
          aria-hidden
        >
          {/* Expanding shockwave rings */}
          {[0, 300].map((delayMs) => (
            <div
              key={delayMs}
              style={{
                position: "absolute",
                inset: "20%",
                borderRadius: "50%",
                border: `1px solid oklch(1 0 0 / ${delayMs === 0 ? 0.55 : 0.3})`,
                animation: `rank-ring-expand 1.4s cubic-bezier(0.1, 0.8, 0.3, 1) ${delayMs}ms forwards`,
                opacity: 0,
              }}
            />
          ))}
          {/* Orbiting particles */}
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={`in-${i}`}
              style={{
                position: "absolute",
                inset: 0,
                animation: "rank-orbit-spin 5s linear infinite",
                animationDelay: `${-(i * (5 / 8)).toFixed(2)}s`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "oklch(0.96 0.03 260)",
                  boxShadow: "0 0 6px 2px oklch(1 0 0 / 0.45)",
                  transform: "translate(-50%, -50%) translateX(112px)",
                  animation: "rank-dot-appear 0.5s ease-out 0.4s both",
                }}
              />
            </div>
          ))}
          {/* Slower orbiting particles */}
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={`out-${i}`}
              style={{
                position: "absolute",
                inset: 0,
                animation: "rank-orbit-spin 8s linear infinite",
                animationDelay: `${-(i * (8 / 5)).toFixed(2)}s`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 2.5,
                  height: 2.5,
                  borderRadius: "50%",
                  background: "oklch(0.85 0.04 260)",
                  boxShadow: "0 0 5px 1.5px oklch(1 0 0 / 0.3)",
                  transform: "translate(-50%, -50%) translateX(138px)",
                  animation: "rank-dot-appear 0.5s ease-out 0.6s both",
                }}
              />
            </div>
          ))}
        </div>,
        document.body,
      )}

      {/* Badge wrapper with isolation */}
      <div style={{ position: "relative", isolation: "isolate" }}>
        {/* Rotating halo — behind badge via z-index: -1 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayClass.badge}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: 200,
            height: 200,
            margin: "auto",
            objectFit: "contain",
            transform: "scale(3)",
            transformOrigin: "center",
            opacity: showCelebrationFX ? 0.45 : 0,
            filter: "blur(38px) saturate(2.2) brightness(1.5)",
            animation: "rank-rays-spin 14s linear infinite",
            transition: "opacity 0.6s ease",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />

        <div
          ref={badgeRef}
          key={badgeKey}
          className={cn(badgeAnimClass)}
          style={badgeStyle}
        >
          <BadgeGlow
            src={displayClass.badge}
            alt={displayClass.name}
            width={520}
            height={520}
            priority
            intensity="strong"
            className="h-[200px] w-[200px] sm:h-[260px] sm:w-[260px]"
            imageClassName="mx-auto w-full object-contain"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h1
          className={cn(
            "text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.1] tracking-tight",
            phase === "celebrating" || !isComplete ? "text-hi" : "text-foreground",
          )}
          style={
            isComplete
              ? { textShadow: "0 0 60px oklch(0.62 0.19 260 / 0.25)" }
              : { textShadow: "0 0 48px oklch(0.62 0.19 260 / 0.4)" }
          }
        >
          {displayClass.name}
        </h1>

        {/* Stacked grid: phrase + cells, and level ticker occupy same space */}
        <div className="grid w-full justify-items-center">
          {/* Phrase + cell count — opacity toggles */}
          <div
            className="col-start-1 row-start-1 flex flex-col items-center gap-2"
            style={{
              opacity: showPhrase ? 1 : 0,
              transition: `opacity ${showPhrase ? "300ms" : "50ms"} ease`,
              pointerEvents: showPhrase ? undefined : "none",
            }}
          >
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {visiblePhrase}
            </p>
            {/* Cell count — inline below phrase */}
            <div
              className={cn(
                "flex items-center gap-1.5 transition-opacity duration-700",
                isComplete ? "opacity-100" : "opacity-0",
              )}
            >
              <Hexagon
                aria-hidden
                strokeWidth={1}
                size={14}
                className="text-hi"
                style={{ filter: "drop-shadow(0 0 6px oklch(0.62 0.19 260 / 0.6))" }}
              />
              <span className="ticker ticker-tabular text-xs font-medium text-hi">
                {formatFullNumber(Math.round(animatedCells))}
              </span>
              <span className="ticker text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">
                cells
              </span>
            </div>
          </div>

          {/* Level ticker — fades out when phrase appears */}
          <span
            className="col-start-1 row-start-1 self-start ticker text-xs uppercase tracking-[0.28em] text-muted-foreground"
            style={{
              opacity: showPhrase ? 0 : 1,
              transition: `opacity ${showPhrase ? "50ms" : "300ms"} ease`,
              pointerEvents: showPhrase ? "none" : undefined,
            }}
          >
            {"// level"}{" "}
            <span className="ticker-tabular text-foreground/70">
              {String(currentLevel).padStart(2, "0")}
            </span>
          </span>
        </div>
      </div>

      <div key={`bar-${segmentIndex}`} className="w-full max-w-xs">
        <div className="mb-2 flex items-end justify-between text-xs uppercase tracking-[0.26em] text-muted-foreground">
          <span className="ticker">
            {isMilestoneSegment && !isComplete
              ? `xp · unlock ${(nextClass ?? displayClass).name.toLowerCase()}`
              : "xp · current level"}
          </span>
          <span className="ticker ticker-tabular text-hi">
            {barFillPercent}%
          </span>
        </div>

        <div className="relative h-2 w-full overflow-hidden border border-white/10 bg-white/[0.03]">
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: `${barFillPercent}%`,
              background:
                "linear-gradient(90deg, oklch(0.5 0.18 260) 0%, oklch(0.62 0.19 260) 60%, oklch(0.7 0.2 270) 100%)",
              boxShadow:
                "0 0 12px oklch(0.62 0.19 260 / 0.45), inset 0 0 6px oklch(1 0 0 / 0.2)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent 0 32px, oklch(0 0 0 / 0.25) 32px 33px)",
            }}
          />
        </div>

        <div className="mt-2 flex items-baseline justify-between text-xs">
          {isComplete ? (
            <>
              <span className="ticker ticker-tabular text-foreground/70">
                {formatFullNumber(finalProgress.xpInLevel)}
                <span className="text-muted-foreground/50">
                  {" "}/ {formatFullNumber(finalProgress.xpNeeded)}
                </span>
              </span>
              <span className="ticker uppercase tracking-[0.22em] text-muted-foreground">
                next lvl{" "}
                <span className="ticker-tabular normal-case tracking-normal text-foreground/60">
                  {finalProgress.level + 1}
                </span>
              </span>
            </>
          ) : (
            <>
              <span className="ticker ticker-tabular text-foreground/70">
                {formatFullNumber(animatedXp)}
                <span className="text-muted-foreground/50"> xp</span>
              </span>
              <span className="ticker uppercase tracking-[0.22em] text-muted-foreground">
                lvl{" "}
                <span className="ticker-tabular normal-case tracking-normal text-foreground/60">
                  {currentLevel}
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Sync debrief — only in sync dialog mode */}
      {diffSummary && (
        <div
          className={cn(
            "flex flex-col items-center gap-3 transition-all duration-700",
            isComplete ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2",
          )}
        >
          <div className="flex items-center gap-3 text-xs">
            {/* XP gained */}
            <div className="flex items-center gap-1.5 rounded-sm border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
              <span className="ticker-tabular font-medium text-hi">
                +{formatFullNumber(diffSummary.xpGained)}
              </span>
              <span className="ticker uppercase tracking-[0.22em] text-muted-foreground">xp</span>
            </div>

            <span className="text-muted-foreground/30">·</span>

            {/* Level */}
            <div className="flex items-center gap-1.5 rounded-sm border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
              <span className="ticker uppercase tracking-[0.22em] text-muted-foreground">lvl</span>
              {diffSummary.levelAfter > diffSummary.levelBefore ? (
                <>
                  <span className="ticker-tabular text-muted-foreground/60">{diffSummary.levelBefore}</span>
                  <ArrowRight
                    weight="duotone"
                    size={13}
                    aria-hidden
                    className="shrink-0 text-hi/70"
                    style={{
                      filter: "drop-shadow(0 0 4px oklch(0.62 0.19 260 / 0.55))",
                    }}
                  />
                  <span className="ticker-tabular font-medium text-hi">{diffSummary.levelAfter}</span>
                </>
              ) : (
                <span className="ticker-tabular text-foreground/60">{diffSummary.levelAfter}</span>
              )}
            </div>

            {/* Cells — only show if gained */}
            {diffSummary.cellAfter > diffSummary.cellBefore && (
              <>
                <span className="text-muted-foreground/30">·</span>
                <div className="flex items-center gap-1.5 rounded-sm border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                  <Hexagon
                    aria-hidden
                    strokeWidth={1}
                    size={11}
                    className="text-hi"
                    style={{ filter: "drop-shadow(0 0 4px oklch(0.62 0.19 260 / 0.5))" }}
                  />
                  <span className="ticker-tabular font-medium text-hi">
                    +{diffSummary.cellAfter - diffSummary.cellBefore}
                  </span>
                  <span className="ticker uppercase tracking-[0.22em] text-muted-foreground">
                    {diffSummary.cellAfter - diffSummary.cellBefore === 1 ? "cell" : "cells"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          "mt-2 transition-opacity duration-500",
          isComplete ? "opacity-100 anim-reveal-up" : "pointer-events-none opacity-0",
        )}
      >
        <Button
          onClick={onDone ?? (() => router.push("/profile"))}
          className="h-10 px-8 text-sm tracking-wide"
        >
          {ctaLabel}
        </Button>
      </div>

      {/* Keep decoded bitmaps warm */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        {playerClasses
          ?.filter((cls) => loadedBadges.has(cls.badge))
          .map((cls) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={`warm-${cls.slug}`}
              src={cls.badge}
              alt=""
              decoding="async"
            />
          ))}
      </div>
    </div>
  );
}
