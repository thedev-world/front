"use client";

import type { NextCellUnlock } from "@/features/auth/types/me";
import {
  CellDiamondMarker,
  CellUnlockCallout,
  resolveCellUnlockCallout,
} from "@/features/developer/components/cell-unlock-callout";
import { cn } from "@/lib/utils";

type Props = {
  percent: number;
  nextCellUnlock?: NextCellUnlock | null;
  barClassName?: string;
  fillClassName?: string;
  animatedFill?: boolean;
};

export function XpProgressBar({
  percent,
  nextCellUnlock,
  barClassName = "h-2.5",
  fillClassName,
  animatedFill = true,
}: Props) {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const callout = nextCellUnlock
    ? resolveCellUnlockCallout(nextCellUnlock)
    : null;
  const showInLevel = callout?.align === "center" && callout.atPercent != null;

  const fillStyle = {
    ...(animatedFill
      ? { "--xp-target": `${clampedPercent}%` }
      : { "--xp-fill": `${clampedPercent}%` }),
  } as React.CSSProperties;

  return (
    <div className="relative w-full overflow-visible">
      <div className="relative">
        {callout && (
          <CellUnlockCallout {...callout} className="bottom-full mb-1" />
        )}

        <div
          className={cn(
            "relative w-full overflow-hidden border border-white/10 bg-white/[0.03]",
            barClassName,
          )}
        >
          <div
            className={cn(
              "absolute inset-y-0 left-0 bg-hi-gradient shadow-hi-glow",
              animatedFill && "anim-xp-fill",
              !animatedFill && "w-[var(--xp-fill)]",
              fillClassName,
            )}
            style={fillStyle}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_32px,oklch(0_0_0/0.25)_32px_33px)]"
          />
        </div>

        {showInLevel && callout.atPercent != null && (
          <CellDiamondMarker atPercent={callout.atPercent} />
        )}
      </div>
    </div>
  );
}
