import { useMemo } from "react"

import { useMe } from "@/features/auth/api/use-me"
import { usePlanetData } from "../api/use-planet-data"
import type { Island, Territory } from "../types/snapshot"

export type LeaderboardEntry = Territory & {
  rank: number
  island: Island | undefined
  isMe: boolean
}

export type IslandLeaderboard = {
  island: Island
  entries: LeaderboardEntry[]
  myIslandRank: LeaderboardEntry | null
}

export type PlanetLeaderboard = {
  topAll: LeaderboardEntry[]
  myGlobalRank: LeaderboardEntry | null
  byIsland: IslandLeaderboard[]
}

function rankEntries(
  territories: Territory[],
  islands: Island[],
  myLogin: string | undefined,
  limit: number,
): LeaderboardEntry[] {
  return territories
    .slice()
    .sort((a, b) => b.cellCount - a.cellCount)
    .slice(0, limit)
    .map((t, i) => ({
      ...t,
      rank: i + 1,
      island: islands.find((island) => island.id === t.islandId),
      isMe: !!myLogin && t.login === myLogin,
    }))
}

export function usePlanetLeaderboard(): PlanetLeaderboard | null {
  const { data: snapshot } = usePlanetData()
  const { data: me } = useMe()

  return useMemo(() => {
    if (!snapshot) return null

    const { territories, islands } = snapshot
    const myLogin = me?.github_login

    const allRanked = rankEntries(territories, islands, myLogin, territories.length)
    const topAll = allRanked.slice(0, 10)
    const myGlobalRank = myLogin
      ? (allRanked.find((e) => e.isMe && e.rank > 10) ?? null)
      : null

    const byIsland: IslandLeaderboard[] = islands
      .map((island) => {
        const islandTerritories = territories.filter((t) => t.islandId === island.id)
        const allRankedIsland = rankEntries(islandTerritories, islands, myLogin, islandTerritories.length)
        const topEntries = allRankedIsland.slice(0, 5)
        const myIslandRank = myLogin
          ? (allRankedIsland.find((e) => e.isMe && e.rank > 5) ?? null)
          : null
        return {
          island,
          entries: topEntries,
          myIslandRank,
        }
      })
      .filter((il) => il.entries.length > 0)
      .sort((a, b) => {
        const topA = a.entries[0]?.cellCount ?? 0
        const topB = b.entries[0]?.cellCount ?? 0
        return topB - topA
      })

    return { topAll, myGlobalRank, byIsland }
  }, [snapshot, me?.github_login])
}
