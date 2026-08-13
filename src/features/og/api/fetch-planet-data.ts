import { getBackendUrl } from "@/config/env"
import type { PlanetApiResponse } from "@/features/planet/types/snapshot"

export async function fetchPlanetData(): Promise<PlanetApiResponse> {
  const res = await fetch(`${getBackendUrl()}/api/v1/planet`)
  if (!res.ok) return { updated_at: "", islands: {} }
  return res.json()
}
