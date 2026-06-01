import { useQuery } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { buildPlanetSnapshot } from "../lib/island-placement"
import type { PlanetApiResponse, PlanetSnapshot } from "../types/snapshot"

async function fetchPlanetData(): Promise<PlanetSnapshot> {
  const res = await apiFetch("/api/v1/planet")
  if (!res.ok) throw new Error(`Failed to fetch planet data: ${res.status}`)
  const data: PlanetApiResponse = await res.json()
  return buildPlanetSnapshot(data)
}

export function usePlanetData() {
  return useQuery({
    queryKey: ["planet-data"],
    queryFn: fetchPlanetData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
