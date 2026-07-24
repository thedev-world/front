import { useMemo } from "react"

import { useEnrichedPlanetData } from "@/features/planet/api/use-enriched-planet-data"

export type DeveloperRanks = {
  islandRank: number
  islandTotal: number
  globalRank: number
  globalTotal: number
}

/**
 * Ranks a developer (by cell count) within their island and globally,
 * derived from the planet snapshot already loaded in the browser.
 */
export function useDeveloperRanks(
  login: string | null,
  islandId: string | null,
): DeveloperRanks | null {
  const { data: snapshot } = useEnrichedPlanetData()

  return useMemo(() => {
    if (!snapshot || !login) return null
    const loginLower = login.toLowerCase()

    const allSorted = [...snapshot.territories].sort((a, b) => b.cellCount - a.cellCount)
    const globalRank = allSorted.findIndex((t) => t.githubLogin.toLowerCase() === loginLower) + 1

    const islandUsers = islandId
      ? snapshot.territories.filter((t) => t.islandId === islandId)
      : []
    const islandSorted = [...islandUsers].sort((a, b) => b.cellCount - a.cellCount)
    const islandRank = islandSorted.findIndex((t) => t.githubLogin.toLowerCase() === loginLower) + 1

    return {
      islandRank,
      islandTotal: islandUsers.length,
      globalRank,
      globalTotal: allSorted.length,
    }
  }, [snapshot, login, islandId])
}
