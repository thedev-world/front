"use client";

import {
  Box,
  GitCommit,
  GitFork,
  GitPullRequest,
  Hexagon,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";
import { IslandTag } from "@/components/ui/island-tag";
import type { ReactNode } from "react";
import type { MeProfile } from "@/features/auth/types/me";
import { BadgeGlow } from "@/components/ui/badge-glow";
import { getIslandImagePath, getIslandLabel } from "@/features/onboarding/lib/island-image";
import { formatCompactNumber } from "@/features/profile/lib/format";
import { useCountUp } from "@/features/profile/lib/use-count-up";

type Props = { profile: MeProfile };

function StatItem({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  delay?: number;
}) {
  const animated = useCountUp(value, { duration: 1500, delay: 200 + delay });
  return (
    <div className="flex flex-col gap-2 border border-white/[0.05] bg-white/[0.01] p-4 transition-colors duration-300 hover:border-white/[0.09]">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span className="[&_svg]:size-3">{icon}</span>
        <span className="ticker text-[10px] uppercase tracking-[0.24em]">{label}</span>
      </div>
      <span className="ticker ticker-tabular text-[1.6rem] font-semibold leading-none text-foreground/80">
        {formatCompactNumber(Math.round(animated))}
      </span>
    </div>
  );
}

export function CellsShowcase({ profile }: Props) {
  const cellsDisplay = useCountUp(profile.cell_count, { duration: 2000, delay: 150 });
  const islandSrc = getIslandImagePath(profile.island);
  const islandLabel = getIslandLabel(profile.island);

  return (
    <section
      className="relative anim-reveal-up"
      style={{ animationDelay: "100ms" }}
      aria-labelledby="cells-heading"
    >
      <div className="relative overflow-hidden border border-white/[0.08] bg-white/[0.02]">

        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.19 288 / 0.25) 0%, transparent 70%)",
            filter: "blur(24px)",
          }}
        />

        <div className="relative z-10 grid divide-y divide-white/[0.06] sm:grid-cols-[1fr_1px_1fr] sm:divide-x sm:divide-y-0">

          {/* ── Left: Territory ── */}
          <div className="relative overflow-hidden px-8 py-10 sm:px-10 lg:px-12 lg:py-12">

            {/* Island image — decorative, bottom-right, clipped */}
            {islandSrc && (
              <>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 hidden sm:block"
                  style={{
                    background:
                      "radial-gradient(ellipse at 100% 100%, transparent 30%, oklch(0.08 0 0 / 0.85) 70%)",
                  }}
                />
                <div className="pointer-events-none absolute -bottom-8 -right-12 hidden sm:block" aria-hidden>
                  <BadgeGlow
                    src={islandSrc}
                    alt=""
                    width={280}
                    height={280}
                    intensity="strong"
                    className="w-[220px] opacity-40"
                    imageClassName="w-full object-contain"
                    glowClassName="scale-[1.2] opacity-40 blur-[24px]"
                  />
                </div>
              </>
            )}

            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <h2
                  id="cells-heading"
                  className="ticker text-sm font-medium uppercase tracking-widest text-foreground/70"
                >
                  Territory
                </h2>
                {islandLabel && <IslandTag label={islandLabel} />}
              </div>

              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Each commit, review, and contribution anchors a cell to your
                territory across the network.
              </p>

              {/* Hexagon cell count */}
              <div className="relative flex w-fit items-center justify-center">
                <Hexagon
                  aria-hidden
                  className="text-hi"
                  strokeWidth={0.75}
                  style={{
                    width: "clamp(7rem, 14vw, 9rem)",
                    height: "clamp(7rem, 14vw, 9rem)",
                    filter: "drop-shadow(0 0 18px oklch(0.72 0.19 288 / 0.35))",
                  }}
                />
                <div className="absolute flex flex-col items-center gap-0.5">
                  <span
                    className="font-semibold leading-none tracking-tight text-hi ticker-tabular"
                    style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)" }}
                  >
                    {Math.round(cellsDisplay)}
                  </span>
                  <span className="ticker text-xs uppercase tracking-widest text-muted-foreground">
                    cells
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div className="hidden bg-white/[0.06] sm:block" aria-hidden />

          <div className="px-8 py-10 sm:px-10 lg:px-12 lg:py-12">
            <h3 className="ticker mb-6 text-sm font-medium uppercase tracking-widest text-foreground/70">
              Stats
            </h3>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              <StatItem icon={<GitCommit />} label="Commits" value={profile.commits_alltime} delay={0} />
              <StatItem icon={<GitPullRequest />} label="Pull Requests" value={profile.prs_contributions_alltime} delay={40} />
              <StatItem icon={<MessageSquare />} label="Reviews" value={profile.reviews_alltime} delay={80} />
              <StatItem icon={<Star />} label="Stars" value={profile.stars_received_capped} delay={120} />
              <StatItem icon={<Users />} label="Followers" value={profile.followers} delay={160} />
              <StatItem icon={<GitFork />} label="Forks" value={profile.forks_received} delay={200} />
              <StatItem icon={<Box />} label="Repos" value={profile.owned_non_fork_repos_count} delay={240} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

