import type { MeProfile } from "@/features/auth/types/me"

import { buildPlanetSnapshot } from "./island-placement"
import type { PlanetApiResponse, PlanetSnapshot } from "../types/snapshot"

/**
 * Returns the index of the user's territory in snapshot.territories, or null if absent.
 */
export function findMyTerritoryIndex(
  snapshot: PlanetSnapshot,
  githubLogin: string,
): number | null {
  const idx = snapshot.territories.findIndex((t) => t.githubLogin === githubLogin)
  return idx === -1 ? null : idx
}

/**
 * Injects the authenticated user into the snapshot if they are missing.
 *
 * Reconstructs a PlanetApiResponse from the existing snapshot (preserving all
 * territory positions), appends the user at the end of their island's dev list,
 * then rebuilds the snapshot. Existing territories are unaffected because BFS
 * growth is deterministic and the user is placed last.
 *
 * Returns the original snapshot unchanged when:
 * - The user is already present
 * - The user has no island or zero cells
 */
export function buildSnapshotWithMe(
  snapshot: PlanetSnapshot,
  me: MeProfile,
): PlanetSnapshot {
  const { github_login: githubLogin, island: islandId, cell_count: cellCount } = me

  if (!islandId || cellCount <= 0) return snapshot
  if (snapshot.territories.some((t) => t.githubLogin === githubLogin)) return snapshot

  // Rebuild islands map from the snapshot's territory list
  const islandsMap: Record<string, [string, number][]> = {}
  for (const island of snapshot.islands) {
    islandsMap[island.id] = []
  }
  for (const territory of snapshot.territories) {
    if (!islandsMap[territory.islandId]) {
      islandsMap[territory.islandId] = []
    }
    islandsMap[territory.islandId].push([territory.githubLogin, territory.cellCount])
  }

  // Make sure the user's island exists, then append the user at the end
  if (!islandsMap[islandId]) {
    islandsMap[islandId] = []
  }
  islandsMap[islandId].push([githubLogin, cellCount])

  const apiResponse: PlanetApiResponse = {
    updated_at: snapshot.version,
    islands: islandsMap,
  }

  return buildPlanetSnapshot(apiResponse)
}
