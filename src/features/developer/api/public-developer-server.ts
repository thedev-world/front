import { getBackendUrl } from "@/config/env"

import type { DeveloperPublicProfile } from "../types/developer-public"

/**
 * Server-side fetch for a developer's public dossier.
 * Returns null when the developer is not found or the request fails.
 * Use only in server components, route handlers, or Next.js metadata helpers.
 */
export async function fetchPublicDeveloperServer(
  login: string,
): Promise<DeveloperPublicProfile | null> {
  try {
    const res = await fetch(
      `${getBackendUrl()}/api/v1/user/${encodeURIComponent(login)}`,
      { signal: AbortSignal.timeout(5000) },
    )
    if (!res.ok) return null
    return (await res.json()) as DeveloperPublicProfile
  } catch {
    return null
  }
}
