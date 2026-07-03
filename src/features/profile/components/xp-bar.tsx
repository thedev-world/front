"use client";

import type { MeXpProgress } from "@/features/auth/types/me";
import { formatFullNumber } from "@/features/profile/lib/format";
import { useCountUp } from "@/features/profile/lib/use-count-up";

type Props = {
  progress: MeXpProgress;
};

export function XpBar({ progress }: Props) {
  const percent = Math.max(0, Math.min(100, progress.percent));
  const xpDisplay = useCountUp(progress.xp_in_level, {
    duration: 1500,
    delay: 350,
  });
  const percentDisplay = useCountUp(percent, { duration: 1500, delay: 350 });

  const fillStyle = {
    "--xp-target": `${percent}%`,
  } as React.CSSProperties;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-end justify-between text-xs uppercase tracking-[0.26em] text-muted-foreground">
        <span className="ticker">xp · lvl {progress.level}</span>
        <span className="ticker text-hi ticker-tabular">
          {percentDisplay.toFixed(0)}%
        </span>
      </div>

      <div className="relative h-2.5 w-full overflow-hidden border border-white/10 bg-white/[0.03]">
        <div
          className="absolute inset-y-0 left-0 anim-xp-fill"
          style={{
            ...fillStyle,
            background:
              "linear-gradient(90deg, oklch(0.52 0.20 282) 0%, oklch(0.72 0.19 288) 60%, oklch(0.78 0.15 292) 100%)",
            boxShadow:
              "0 0 12px oklch(0.72 0.19 288 / 0.45), inset 0 0 6px oklch(1 0 0 / 0.2)",
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
        <span className="ticker ticker-tabular text-foreground/70">
          {formatFullNumber(Math.round(xpDisplay))}
          <span className="text-muted-foreground/50">
            {" "}/ {formatFullNumber(progress.xp_needed)}
          </span>
        </span>
        <span className="ticker text-xs uppercase tracking-[0.22em] text-muted-foreground">
          next lvl : {progress.level + 1}
        </span>
      </div>
    </div>
  );
}
