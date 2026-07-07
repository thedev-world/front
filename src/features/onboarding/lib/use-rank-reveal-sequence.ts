"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PlayerClassMeta } from "@/features/developer/lib/player-class";
import { PLAYER_CLASS_FALLBACK } from "@/features/developer/lib/player-class";
import {
  type RevealSegment,
  type XpMath,
} from "./xp-math";

export const SEGMENT_MS = 1400;
export const CELEBRATE_MS = 1500;

type Phase = "animating" | "celebrating" | "done";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const EMPTY_PROGRESS = { level: 1, xpInLevel: 0, xpNeeded: 0, percent: 0 };

export function useRankRevealSequence(targetXp: number, xpMath: XpMath | null, startXp = 0) {
  const segments = useMemo(
    () => xpMath?.buildRevealSegments(targetXp, startXp) ?? [],
    [targetXp, startXp, xpMath],
  );

  const [segmentIndex, setSegmentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("animating");
  const [animatedXp, setAnimatedXp] = useState(startXp);

  // advanceToNext uses segmentIndex directly; recreated when segmentIndex changes
  const advanceToNext = useCallback(() => {
    const next = segmentIndex + 1;
    if (next >= segments.length) {
      setPhase("done");
    } else {
      setSegmentIndex(next);
      setPhase("animating");
    }
  }, [segmentIndex, segments.length]);

  useEffect(() => {
    // Wait for backend config before starting animation
    if (!xpMath || phase !== "animating") return;

    const segment = segments[segmentIndex];
    if (!segment) {
      queueMicrotask(() => setPhase("done"));
      return;
    }

    const { fromXp, toXp, pauseAfter } = segment;
    const span = toXp - fromXp;

    if (span <= 0) {
      queueMicrotask(() => {
        setAnimatedXp(toXp);
        if (pauseAfter) setPhase("celebrating");
        else advanceToNext();
      });
      return;
    }

    let rafId = 0;
    const start = performance.now();
    queueMicrotask(() => setAnimatedXp(fromXp));

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / SEGMENT_MS);
      setAnimatedXp(fromXp + span * easeOutCubic(t));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setAnimatedXp(toXp);
        if (pauseAfter) setPhase("celebrating");
        else advanceToNext();
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase, segmentIndex, segments, advanceToNext, xpMath]);

  useEffect(() => {
    if (phase !== "celebrating") return;
    const timer = setTimeout(advanceToNext, CELEBRATE_MS);
    return () => clearTimeout(timer);
  }, [phase, segmentIndex, advanceToNext]);

  const segment: RevealSegment | null = segments[segmentIndex] ?? null;
  const activeSegment = segment ?? segments[segments.length - 1] ?? null;

  const finalProgress = xpMath?.getXpProgress(targetXp) ?? EMPTY_PROGRESS;

  const barProgress =
    !xpMath || phase === "done" || !activeSegment
      ? finalProgress
      : phase === "celebrating" && activeSegment.pauseAfter
        ? xpMath.getSegmentBarProgress(activeSegment, activeSegment.toXp)
        : xpMath.getSegmentBarProgress(activeSegment, Math.round(animatedXp));

  const finalClass: PlayerClassMeta =
    xpMath && segments.length > 0
      ? segments[segments.length - 1]!.targetClass
      : xpMath?.getPlayerClassForLevel(xpMath.getLevel(targetXp)) ?? PLAYER_CLASS_FALLBACK;

  return {
    phase,
    segmentIndex,
    segment: activeSegment,
    animatedXp: Math.round(animatedXp),
    barProgress,
    isComplete: phase === "done",
    finalClass,
    finalProgress,
  };
}
