"use client";

import type { MeXpProgress, NextCellUnlock } from "@/features/auth/types/me";
import { XpProgressBar } from "@/features/developer/components/xp-progress-bar";
import { formatFullNumber } from "@/features/profile/lib/format";
import { useCountUp } from "@/features/profile/lib/use-count-up";

type Props = {
  progress: MeXpProgress;
  nextCellUnlock?: NextCellUnlock | null;
};

export function XpBar({ progress, nextCellUnlock }: Props) {
  const percent = Math.max(0, Math.min(100, progress.percent));
  const xpDisplay = useCountUp(progress.xp_in_level, {
    duration: 1500,
    delay: 350,
  });

  return (
    <div className="w-full">
      <div className="mb-2 text-xs uppercase tracking-[0.26em] text-muted-foreground">
        <span className="ticker">XP</span>
      </div>

      <XpProgressBar percent={percent} nextCellUnlock={nextCellUnlock} />

      <div className="mt-2 flex items-baseline justify-between text-xs">
        <span className="ticker ticker-tabular text-foreground/70">
          <span className="font-semibold">{formatFullNumber(Math.round(xpDisplay))}</span>
          <span className="text-muted-foreground">
            {" "}/ {formatFullNumber(progress.xp_needed)}
          </span>
        </span>
      </div>
    </div>
  );
}
