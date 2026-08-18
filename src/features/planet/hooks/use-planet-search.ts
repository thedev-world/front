import { useMemo, useState } from "react"

import { useMe } from "@/features/auth/api/use-me"
import { useDebounce } from "@/hooks/use-debounce"

import type { Island, Territory } from "../types/snapshot"
import type { LeaderboardEntry } from "./use-planet-leaderboard"

const MAX_RESULTS = 10

export type PlanetSearchState = {
  query: string
  setQuery: (q: string) => void
  results: LeaderboardEntry[]
}

export function usePlanetSearch(
  territories: Territory[],
  islands: Island[],
): PlanetSearchState {
  const [query, setQuery] = useState("")
  const { data: me } = useMe()
  const debouncedQuery = useDebounce(query, 300)

  const results = useMemo(() => {
    const trimmed = debouncedQuery.trim().toLowerCase()
    if (!trimmed) return []

    const myLogin = me?.github_login

    const allSorted = territories
      .slice()
      .sort((a, b) => b.cellCount - a.cellCount)

    return allSorted
      .map((t, i) => ({
        ...t,
        rank: i + 1,
        island: islands.find((island) => island.id === t.islandId),
        isMe: !!myLogin && t.githubLogin === myLogin,
      }))
      .filter((e) => e.githubLogin.toLowerCase().includes(trimmed))
      .slice(0, MAX_RESULTS)
  }, [debouncedQuery, territories, islands, me?.github_login])

  return { query, setQuery, results }
}
