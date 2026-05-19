"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  duration?: number;
  delay?: number;
  enabled?: boolean;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Animates a number from 0 → target with an ease-out curve.
 * When `enabled` is false, jumps straight to the target on next frame.
 */
export function useCountUp(
  target: number,
  { duration = 1400, delay = 0, enabled = true }: Options = {},
): number {
  const [value, setValue] = useState<number>(() => (enabled ? 0 : target));
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);

    if (!enabled) {
      rafRef.current = requestAnimationFrame(() => setValue(target));
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }

    let start: number | null = null;
    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOut(progress);
      setValue(target * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(() => {
      setValue(0);
      timerRef.current = window.setTimeout(() => {
        rafRef.current = requestAnimationFrame(tick);
      }, delay);
    });

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [target, duration, delay, enabled]);

  return value;
}
