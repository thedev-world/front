"use client"

import { BadgeGlow } from "@/components/ui/badge-glow"
import { HudReadoutShell } from "@/components/ui/hud-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/ui/user-avatar"
import {
  BADGE_BY_SLUG,
  type PlayerClassSlug,
} from "@/features/developer/lib/player-class"
import { useDeveloperPreview } from "@/features/developer/api/use-developer-preview"

import { useEnrichedPlanetData } from "../api/use-enriched-planet-data"
import { usePlanetStore } from "../stores/planet-store"

export function TerritoryHoverCard() {
  const { data: snapshot } = useEnrichedPlanetData()
  const { hoveredTerritoryIndex, mousePos } = usePlanetStore()

  const territory =
    hoveredTerritoryIndex !== null
      ? (snapshot?.territories[hoveredTerritoryIndex] ?? null)
      : null

  const { data: developer, isPending } = useDeveloperPreview(territory?.githubLogin ?? null)

  if (!territory || !snapshot) return null

  const island = snapshot.islands.find((i) => i.id === territory.islandId)
  const slug = developer?.player_class.name.trim().toLowerCase() as PlayerClassSlug | undefined
  const badgeSrc = slug ? (BADGE_BY_SLUG[slug] ?? null) : null

  return (
    <div
      className="pointer-events-none fixed z-50 w-[min(14rem,calc(100vw-2rem))]"
      style={{ left: mousePos.x + 14, top: mousePos.y + 14 }}
    >
      <HudReadoutShell innerClassName="overflow-hidden px-3 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            size="sm"
            githubLogin={territory.githubLogin}
            avatarUrl={developer?.avatar_url}
            loading={isPending}
          />

          <div className="min-w-0 flex-1 overflow-hidden">
            <p
              className="truncate text-sm font-medium text-white"
              title={`@${territory.githubLogin}`}
            >
              @{territory.githubLogin}
            </p>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-zinc-400">
              {island && (
                <>
                  <span
                    className="inline-block size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: island.color }}
                  />
                  <span className="min-w-0 truncate">{island.name}</span>
                  <span className="shrink-0">·</span>
                </>
              )}
              <span className="shrink-0 whitespace-nowrap">{territory.cellCount} cells</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex min-w-0 items-center gap-2 border-t border-white/5 pt-2.5">
          <RankFooter isPending={isPending} developer={developer ?? null} badgeSrc={badgeSrc} />
        </div>
      </HudReadoutShell>
    </div>
  )
}

type DeveloperSnippet = {
  player_class: { name: string }
  xp_progress: { level: number }
}

type RankFooterProps = {
  isPending: boolean
  developer: DeveloperSnippet | null
  badgeSrc: string | null
}

function RankFooter({ isPending, developer, badgeSrc }: RankFooterProps) {
  if (isPending) {
    return (
      <>
        <Skeleton className="size-8 shrink-0 rounded" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-2.5 w-14 rounded" />
          <Skeleton className="h-2 w-10 rounded" />
        </div>
      </>
    )
  }

  if (!developer) return null

  if (developer) return (
    <>
      {badgeSrc && (
        <BadgeGlow
          src={badgeSrc}
          alt={developer.player_class.name}
          width={48}
          height={48}
          className="size-7 shrink-0"
          intensity="subtle"
        />
      )}
      <div className="min-w-0 flex-1 overflow-hidden">
        <span className="block truncate text-xs font-medium text-white">
          {developer.player_class.name}
        </span>
        <span className="block truncate text-xs text-zinc-500">
          Level {developer.xp_progress.level}
        </span>
      </div>
    </>
  )
}
