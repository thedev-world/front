import { useMemo } from "react"

import { useMe } from "@/features/auth/api/use-me"
import { useEnrichedPlanetData } from "../api/use-enriched-planet-data"

export type MyPlanetStats = {
  globalRank: number
  globalTotal: number
  islandRank: number
  islandTotal: number
  islandName: string
  cellCount: number
}

export function useMyPlanetStats(): MyPlanetStats | null {
  const { data: snapshot } = useEnrichedPlanetData()
  const { data: me } = useMe()

  return useMemo(() => {
    if (!snapshot || !me?.github_login) return null

    const { territories, islands } = snapshot
    const myLogin = me.github_login

    const allSorted = territories.slice().sort((a, b) => b.cellCount - a.cellCount)
    const globalIndex = allSorted.findIndex((t) => t.login === myLogin)
    if (globalIndex === -1) return null

    const myTerritory = allSorted[globalIndex]

    const islandTerritories = territories
      .filter((t) => t.islandId === myTerritory.islandId)
      .sort((a, b) => b.cellCount - a.cellCount)

    const islandIndex = islandTerritories.findIndex((t) => t.login === myLogin)
    const myIsland = islands.find((i) => i.id === myTerritory.islandId)

    return {
      globalRank: globalIndex + 1,
      globalTotal: territories.length,
      islandRank: islandIndex + 1,
      islandTotal: islandTerritories.length,
      islandName: myIsland?.name ?? myTerritory.islandId,
      cellCount: myTerritory.cellCount,
    }
  }, [snapshot, me?.github_login])
}
