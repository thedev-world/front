"use client";

import type { NextCellUnlock } from "@/features/auth/types/me";
import { formatFullNumber } from "@/features/profile/lib/format";
import { cn } from "@/lib/utils";

export type CellUnlockCalloutConfig = {
  detail: string;
  align: "center" | "end";
  atPercent?: number;
};

export function resolveCellUnlockCallout(
  unlock: NextCellUnlock,
): CellUnlockCalloutConfig | null {
  if (
    unlock.in_current_level &&
    unlock.bar_percent != null &&
    unlock.xp_in_level_at_unlock != null
  ) {
    return {
      align: "center",
      atPercent: unlock.bar_percent,
      detail: `${formatFullNumber(unlock.xp_in_level_at_unlock)} XP`,
    };
  }

  if (!unlock.in_current_level) {
    return {
      align: "end",
      detail: `${formatFullNumber(unlock.unlock_xp)} XP - LVL ${unlock.unlock_level}`,
    };
  }

  return null;
}

type CellUnlockCalloutProps = CellUnlockCalloutConfig & {
  className?: string;
  title?: string;
};

export function CellUnlockCallout({
  title = "+1 cell",
  detail,
  align,
  atPercent,
  className,
}: CellUnlockCalloutProps) {
  return (
    <BarPositioned
      atPercent={atPercent}
      align={align}
      className={cn(
        "bottom-0 z-20 flex flex-col",
        align === "center" && "items-center",
        align === "end" && "items-end",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-0.5 border border-white/10 bg-black/55 px-2 py-1 text-center backdrop-blur-sm">
        <CalloutLine variant="title">{title}</CalloutLine>
        <CalloutLine variant="detail">{detail}</CalloutLine>
      </div>
      <CalloutChevron />
    </BarPositioned>
  );
}

export function CellDiamondMarker({ atPercent }: { atPercent: number }) {
  return (
    <BarPositioned
      atPercent={atPercent}
      className="top-1/2 z-10 -translate-y-1/2"
    >
      <div
        aria-hidden
        className={cn(
          "size-3.5 rotate-45 border border-white/35 bg-hi",
          "shadow-[0_0_14px_oklch(0.72_0.19_288_/_0.75),inset_0_0_4px_oklch(1_0_0_/_0.35)]",
        )}
      />
    </BarPositioned>
  );
}

function CalloutLine({
  variant,
  children,
}: {
  variant: "title" | "detail";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "ticker block whitespace-nowrap text-xs",
        variant === "title" &&
          "font-semibold uppercase tracking-[0.22em] text-hi",
        variant === "detail" &&
          "ticker-tabular tracking-[0.1em] text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function CalloutChevron() {
  return (
    <div
      aria-hidden
      className="size-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-white/15"
    />
  );
}

function BarPositioned({
  atPercent,
  align = "center",
  className,
  children,
}: {
  atPercent?: number;
  align?: "center" | "end";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute",
        align === "center" && atPercent != null && "-translate-x-1/2",
        align === "end" && "right-0",
        className,
      )}
      style={atPercent != null ? { left: `${atPercent}%` } : undefined}
    >
      {children}
    </div>
  );
}
