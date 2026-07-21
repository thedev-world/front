import type { PlanetApiResponse } from "../types/snapshot"

export type DeveloperRanks = {
  islandRank: number
  globalRank: number
  islandTotal: number
  globalTotal: number
}

/** Ranks a developer from the raw planet JSON snapshot. */
export function computeDeveloperRanks(
  planetData: PlanetApiResponse,
  login: string,
  islandId: string,
): DeveloperRanks {
  const loginLower = login.toLowerCase()
  const { islands } = planetData

  const allUsers = Object.values(islands).flat()
  const sorted = [...allUsers].sort((a, b) => b[1] - a[1])
  const globalRank = sorted.findIndex(([l]) => l.toLowerCase() === loginLower) + 1

  const islandUsers = islands[islandId] ?? []
  const islandSorted = [...islandUsers].sort((a, b) => b[1] - a[1])
  const islandRank = islandSorted.findIndex(([l]) => l.toLowerCase() === loginLower) + 1

  return {
    islandRank,
    globalRank,
    islandTotal: islandUsers.length,
    globalTotal: allUsers.length,
  }
}
