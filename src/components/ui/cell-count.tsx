"use client";

import { Hexagon } from "lucide-react";
import { useCountUp } from "@/features/profile/lib/use-count-up";
import { formatFullNumber } from "@/features/profile/lib/format";

type Props = {
  count: number;
  size?: number;
  delay?: number;
  enabled?: boolean;
};

/**
 * Hexagon cell counter with count-up animation
 */
export function CellCount({ count, size = 8, delay = 0, enabled = true }: Props) {
  const animated = useCountUp(count, { duration: 1800, delay, enabled });

  const remSize = `${size}rem`;

  return (
    <div className="relative flex items-center justify-center">
      <Hexagon
        aria-hidden
        className="text-hi"
        strokeWidth={0.75}
        style={{
          width: remSize,
          height: remSize,
          filter: "drop-shadow(0 0 20px oklch(0.72 0.19 288 / 0.4))",
        }}
      />
      <div className="absolute flex flex-col items-center gap-0.5">
        <span className="ticker ticker-tabular font-semibold leading-none tracking-tight text-hi"
          style={{ fontSize: `${size * 0.24}rem` }}>
          {formatFullNumber(Math.round(animated))}
        </span>
        <span className="ticker text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
          cells
        </span>
      </div>
    </div>
  );
}
