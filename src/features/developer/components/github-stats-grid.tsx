"use client"

import { TriangleAlert } from "lucide-react"

import { StatItem } from "@/components/ui/stat-item"
import { Tag } from "@/components/ui/tag"
import { cn } from "@/lib/utils"

import {
  GITHUB_PROFILE_STATS,
  resolveGitHubStats,
  type GitHubStatsSource,
} from "../lib/github-display-stats"
import { GITHUB_STAT_LUCIDE_ICONS } from "../lib/github-stat-icons"

type Props = {
  source: GitHubStatsSource
  animate?: boolean
  showFarmBadge?: boolean
  className?: string
}

export function GitHubStatsGrid({
  source,
  animate = false,
  showFarmBadge = false,
  className,
}: Props) {
  const stats = resolveGitHubStats(source, GITHUB_PROFILE_STATS)

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {stats.map((stat, index) => {
        const Icon = GITHUB_STAT_LUCIDE_ICONS[stat.key]
        const delay = index * 40

        return (
          <StatItem
            key={stat.key}
            icon={<Icon />}
            label={stat.label}
            value={stat.value}
            animate={animate}
            delay={delay}
            badge={
              showFarmBadge && stat.key === "commits" && (
                <Tag
                  label="Flagged activity"
                  icon={
                    <TriangleAlert
                      size={10}
                      className="shrink-0 text-amber-400/70"
                      strokeWidth={1.5}
                    />
                  }
                  variant="warning"
                />
              )
            }
          />
        )
      })}
    </div>
  )
}
