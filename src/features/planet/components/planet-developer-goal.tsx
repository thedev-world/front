"use client";

import { HudTopDock } from "@/components/ui/hud-panel";
import { useCountUp } from "@/features/profile/lib/use-count-up";
import { formatFullNumber } from "@/features/profile/lib/format";
import { usePlanetConfig } from "../api/use-planet-config";
import { useEnrichedPlanetData } from "../api/use-enriched-planet-data";

export function PlanetDeveloperGoal() {
  const { data: snapshot } = useEnrichedPlanetData();
  const { data: config } = usePlanetConfig();

  if (!snapshot || !config) return null;

  const developerCount = snapshot.territories.length;
  const { developerGoal } = config;
  const percent = Math.min(100, (developerCount / developerGoal) * 100);

  return (
    <PlanetDeveloperGoalBar
      developerGoal={developerGoal}
      developerCount={developerCount}
      percent={percent}
    />
  );
}

type BarProps = {
  developerGoal: number;
  developerCount: number;
  percent: number;
};

function PlanetDeveloperGoalBar({
  developerGoal,
  developerCount,
  percent,
}: BarProps) {
  const countDisplay = useCountUp(developerCount, { duration: 1600, delay: 200 });

  const fillStyle = {
    "--xp-target": `${percent}%`,
  } as React.CSSProperties;

  return (
    <HudTopDock
      role="progressbar"
      aria-valuenow={developerCount}
      aria-valuemin={0}
      aria-valuemax={developerGoal}
      aria-label={`Road to ${developerGoal} developers`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
          Road to {formatFullNumber(developerGoal)} developers
        </span>
        <span className="ticker ticker-tabular shrink-0 text-[10px]">
          <span className="font-semibold text-hi">
            {formatFullNumber(Math.round(countDisplay))}
          </span>
          <span className="text-zinc-500"> / {formatFullNumber(developerGoal)}</span>
        </span>
      </div>

      <div className="relative h-1.5 w-full overflow-hidden border border-white/[0.08] bg-white/[0.03]">
        <div
          className="absolute inset-y-0 left-0 anim-xp-fill bg-hi-gradient shadow-hi-glow"
          style={fillStyle}
        />
      </div>
    </HudTopDock>
  );
}
