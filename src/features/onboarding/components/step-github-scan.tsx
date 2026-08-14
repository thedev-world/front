"use client";

import { useEffect, useState } from "react";
import {
  Box,
  GitCommit,
  GitFork,
  GitPullRequest,
  Loader2,
  Lock,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMe } from "@/features/auth/api/use-me";
import type { MeProfile } from "@/features/auth/types/me";
import { formatFullNumber } from "@/features/profile/lib/format";
import { useCountUp } from "@/features/profile/lib/use-count-up";

const COUNT_DURATION_MS = 1800;
const COUNT_START_DELAY_MS = 300;
const COUNT_STAGGER_MS = 80;
const HOLD_AFTER_COUNT_MS = 1400;

type StatDef = {
  label: string;
  icon: LucideIcon;
  getValue: (profile: MeProfile) => number;
};

const GITHUB_STATS: StatDef[] = [
  { label: "Commits",         icon: GitCommit,     getValue: (p) => p.commits_alltime },
  { label: "Pull Requests",   icon: GitPullRequest,getValue: (p) => p.prs_contributions_alltime },
  { label: "Reviews",         icon: MessageSquare, getValue: (p) => p.reviews_alltime },
  { label: "Private activity",icon: Lock,          getValue: (p) => p.private_contributions_alltime },
  { label: "Stars",           icon: Star,          getValue: (p) => p.stars_received_capped },
  { label: "Followers",       icon: Users,         getValue: (p) => p.followers },
  { label: "Forks",           icon: GitFork,       getValue: (p) => p.forks_received },
  { label: "Repos",           icon: Box,           getValue: (p) => p.owned_non_fork_repos_count },
];

export const SCAN_SEQUENCE_MS =
  COUNT_START_DELAY_MS +
  (GITHUB_STATS.length - 1) * COUNT_STAGGER_MS +
  COUNT_DURATION_MS +
  HOLD_AFTER_COUNT_MS;

function ScanStatCell({
  stat,
  value,
  index,
}: {
  stat: StatDef;
  value: number;
  index: number;
}) {
  const cellDelay = COUNT_START_DELAY_MS + index * COUNT_STAGGER_MS;
  const animated = useCountUp(value, { duration: COUNT_DURATION_MS, delay: cellDelay });
  const progress = value > 0 ? animated / value : 1;
  const settled = progress > 0.96;

  return (
    <div
      className="anim-reveal-up flex min-h-[110px] flex-col justify-between border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5"
      style={{ animationDelay: `${index * 45}ms`, animationDuration: "0.6s" }}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-muted-foreground">
        <stat.icon aria-hidden className="size-3.5" />
        <span className="ticker">{stat.label}</span>
      </div>
      <span
        className={cn(
          "mt-5 ticker ticker-tabular text-[clamp(1.6rem,3vw,2.1rem)] font-semibold leading-none",
          "transition-[color,text-shadow] duration-700",
          settled ? "text-foreground/80" : "text-hi",
        )}
        style={
          settled
            ? undefined
            : {
                textShadow:
                  "0 0 16px oklch(0.72 0.19 288 / 0.4), 0 0 40px oklch(0.52 0.20 282 / 0.18)",
              }
        }
      >
        {formatFullNumber(Math.round(animated))}
      </span>
    </div>
  );
}

type Props = { onComplete: () => void };

export function StepGithubScan({ onComplete }: Props) {
  const { data: me } = useMe();
  const [allDone, setAllDone] = useState(false);

  const countEnd = COUNT_START_DELAY_MS +
    (GITHUB_STATS.length - 1) * COUNT_STAGGER_MS +
    COUNT_DURATION_MS;

  useEffect(() => {
    const doneTimer = window.setTimeout(() => setAllDone(true), countEnd);
    const exitTimer = window.setTimeout(onComplete, SCAN_SEQUENCE_MS);
    return () => {
      window.clearTimeout(doneTimer);
      window.clearTimeout(exitTimer);
    };
  }, [onComplete, countEnd]);

  if (!me) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="ticker text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          {"// analyzing"}
        </p>
        <h1 className="text-[clamp(1.5rem,3.5vw,2rem)] font-semibold tracking-tight">
          Your GitHub footprint
        </h1>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {GITHUB_STATS.map((stat, index) => (
          <ScanStatCell
            key={stat.label}
            stat={stat}
            value={stat.getValue(me)}
            index={index}
          />
        ))}
      </div>

      <div
        className="flex items-center gap-2.5 transition-opacity duration-700"
        style={{ opacity: allDone ? 1 : 0 }}
      >
        <span className="size-1.5 rounded-full bg-hi shadow-[0_0_8px_oklch(0.72_0.19_288_/_0.7)]" />
        <span className="ticker text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
          Computing your rank
        </span>
      </div>
    </div>
  );
}
