import { useMemo } from "react"

import { useMe } from "@/features/auth/api/use-me"
import { buildSnapshotWithMe } from "../lib/planet-me"
import { usePlanetData } from "./use-planet-data"

/**
 * Returns the planet snapshot enriched with the authenticated user's territory
 * when they are absent from the cached API response (upload cache lag).
 */
export function useEnrichedPlanetData() {
  const query = usePlanetData()
  const { data: me } = useMe()

  const data = useMemo(() => {
    if (!query.data || !me) return query.data
    return buildSnapshotWithMe(query.data, me)
  }, [query.data, me])

  return { ...query, data }
}
