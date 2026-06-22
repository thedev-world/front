"use client";

import { Users } from "lucide-react";

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
  const percentDisplay = useCountUp(percent, { duration: 1600, delay: 200 });

  const fillStyle = {
    "--xp-target": `${percent}%`,
  } as React.CSSProperties;

  return (
    <div
      className="w-[min(92vw,22rem)] border border-white/20 bg-black/40 px-4 py-2.5 shadow-2xl backdrop-blur-md sm:w-80"
      role="progressbar"
      aria-valuenow={developerCount}
      aria-valuemin={0}
      aria-valuemax={developerGoal}
      aria-label={`Road to ${developerGoal} developers`}
    >
      <div className="mb-2 flex items-center gap-2">
        <Users size={11} className="shrink-0 text-cyan-400/90" aria-hidden="true" />
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
          Road to {formatFullNumber(developerGoal)} developers
        </span>
        <span className="ticker ticker-tabular text-[10px] font-medium text-hi">
          {percentDisplay.toFixed(0)}%
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden border border-white/10 bg-white/[0.03]">
        <div
          className="absolute inset-y-0 left-0 anim-xp-fill"
          style={{
            ...fillStyle,
            background:
              "linear-gradient(90deg, oklch(0.48 0.16 200) 0%, oklch(0.58 0.18 195) 55%, oklch(0.68 0.19 185) 100%)",
            boxShadow:
              "0 0 14px oklch(0.58 0.18 195 / 0.5), inset 0 0 6px oklch(1 0 0 / 0.18)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 24px, oklch(0 0 0 / 0.22) 24px 25px)",
          }}
        />
      </div>

      <div className="mt-1.5 flex items-baseline justify-between text-[10px]">
        <span className="ticker ticker-tabular text-zinc-400">
          <span className="font-medium text-zinc-200">
            {formatFullNumber(Math.round(countDisplay))}
          </span>
          <span className="text-zinc-400">
            {" "}/ {formatFullNumber(developerGoal)}
          </span>
        </span>
        <span className="ticker uppercase tracking-[0.16em] text-zinc-400">
          on the islands
        </span>
      </div>
    </div>
  );
}
