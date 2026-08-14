"use client"

import {
  Box,
  GitCommit,
  GitFork,
  GitPullRequest,
  Globe,
  Hexagon,
  Lock,
  MapPin,
  MessageSquare,
  Star,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { BackButton } from "@/components/ui/back-button"
import { BadgeGlow } from "@/components/ui/badge-glow"
import { ExternalLink } from "@/components/ui/external-link"
import { HudReadoutShell } from "@/components/ui/hud-panel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { StatItem } from "@/components/ui/stat-item"
import { Tag } from "@/components/ui/tag"
import { UserAvatar } from "@/components/ui/user-avatar"
import {
  BADGE_BY_SLUG,
  PLAYER_CLASS_FALLBACK,
  type PlayerClassSlug,
} from "@/features/developer/lib/player-class"
import type { DeveloperPublicProfile } from "@/features/developer/types/developer-public"
import { getIslandLabel } from "@/features/onboarding/lib/island-image"
import { cn } from "@/lib/utils"

import {
  DeveloperNotFoundError,
  useDeveloperProfile,
} from "../api/use-developer-profile"
import { useDeveloperRanks } from "../hooks/use-developer-ranks"

type Props = {
  login: string
}

export function DeveloperProfileCard({ login }: Props) {
  const router = useRouter()
  const { data, isPending, error } = useDeveloperProfile(login)
  const ranks = useDeveloperRanks(data?.github_login ?? null, data?.island ?? null)

  const notFound = error instanceof DeveloperNotFoundError

  return (
    <HudReadoutShell className="flex h-full min-h-0 flex-col" innerClassName="flex h-full min-h-0 flex-col">
      <BackButton onClick={() => router.push("/")}>Back to planet</BackButton>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-5 px-6 pb-6 pt-2">
          {notFound ? (
            <NotFoundState login={login} />
          ) : isPending || !data ? (
            <LoadingState />
          ) : (
            <ProfileContent data={data} ranks={ranks} />
          )}
        </div>
      </ScrollArea>
    </HudReadoutShell>
  )
}

function ProfileContent({
  data,
  ranks,
}: {
  data: DeveloperPublicProfile
  ranks: ReturnType<typeof useDeveloperRanks>
}) {
  const slug = data.player_class.name.trim().toLowerCase() as PlayerClassSlug
  const badge = BADGE_BY_SLUG[slug] ?? PLAYER_CLASS_FALLBACK.badge
  const islandLabel = getIslandLabel(data.island)

  return (
    <>
      <div className="flex items-center gap-4">
        <UserAvatar size="lg" githubLogin={data.github_login} avatarUrl={data.avatar_url} />
        <div className="min-w-0 flex-1">
          <ExternalLink
            href={`https://github.com/${encodeURIComponent(data.github_login)}`}
            title={`@${data.github_login}`}
          >
            @{data.github_login}
          </ExternalLink>
          {islandLabel && (
            <Tag label={`${islandLabel} Islands`} className="mt-1.5" />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2.5 border-l border-white/[0.06] pl-3">
          <BadgeGlow
            src={badge}
            alt={`${data.player_class.name} rank`}
            width={64}
            height={64}
            intensity="subtle"
            className="size-8 shrink-0"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="ticker truncate text-[10px] font-medium text-zinc-300">
              {data.player_class.name}
            </span>
            <span className="ticker text-[10px] text-zinc-500">
              LVL {data.xp_progress.level}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-5">
        <StatItem
          icon={<MapPin />}
          label="Island"
          value={ranks?.islandRank ? `#${ranks.islandRank}` : "—"}
          suffix={ranks?.islandTotal ? `/ ${ranks.islandTotal}` : undefined}
        />
        <StatItem
          icon={<Globe />}
          label="Global"
          value={ranks?.globalRank ? `#${ranks.globalRank}` : "—"}
          suffix={ranks?.globalTotal ? `/ ${ranks.globalTotal}` : undefined}
        />
        <StatItem
          icon={<Hexagon />}
          label="Territory"
          value={data.cell_count}
          suffix="cells"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-5">
        <h3 className="ticker text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          GitHub stats
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <StatItem icon={<GitCommit />} label="Commits" value={data.commits_alltime} animate />
          <StatItem icon={<GitPullRequest />} label="Pull Requests" value={data.prs_contributions_alltime} animate delay={40} />
          <StatItem icon={<MessageSquare />} label="Reviews" value={data.reviews_alltime} animate delay={80} />
          <StatItem icon={<Lock />} label="Private activity" value={data.private_contributions_alltime} animate delay={120} />
          <StatItem icon={<Star />} label="Stars" value={data.stars_received_capped} animate delay={160} />
          <StatItem icon={<Users />} label="Followers" value={data.followers} animate delay={200} />
          <StatItem icon={<GitFork />} label="Forks" value={data.forks_received} animate delay={240} />
          <StatItem icon={<Box />} label="Repos" value={data.owned_non_fork_repos_count} animate delay={280} />
        </div>
      </div>
    </>
  )
}

function LoadingState() {
  return (
    <>
      <div className="flex items-center gap-3">
        <Skeleton className="size-14 rounded" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-5 w-24 rounded" />
        </div>
        <div className="flex items-center gap-2 border-l border-white/[0.06] pl-3">
          <Skeleton className="size-8 rounded" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-16 rounded" />
            <Skeleton className="h-2 w-10 rounded" />
          </div>
        </div>
      </div>
      <Skeleton className="h-2.5 w-full rounded" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded" />
        ))}
      </div>
    </>
  )
}

function NotFoundState({ login }: { login: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-16 text-center")}>
      <Hexagon size={36} className="text-zinc-600" strokeWidth={1} />
      <p className="ticker text-sm text-white">@{login}</p>
      <p className="max-w-[16rem] text-sm text-muted-foreground">
        This developer has not claimed a territory yet.
      </p>
    </div>
  )
}
