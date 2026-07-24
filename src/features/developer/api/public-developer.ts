import { apiFetch } from "@/lib/api-client"

import type { DeveloperPublicProfile } from "../types/developer-public"

export class DeveloperNotFoundError extends Error {
  constructor(login: string) {
    super(`Developer not found: ${login}`)
    this.name = "DeveloperNotFoundError"
  }
}

/** Normalize so hover + profile share the same cache entry regardless of casing. */
export function normalizeDeveloperLogin(login: string): string {
  return login.trim().toLowerCase()
}

export const developerQueryKey = (login: string) =>
  ["developer", normalizeDeveloperLogin(login)] as const

/**
 * Public developer dossier — same payload for hover preview and /u/{login} card.
 */
export async function fetchPublicDeveloper(
  login: string,
): Promise<DeveloperPublicProfile> {
  const res = await apiFetch(`/api/v1/user/${encodeURIComponent(login)}`, {
    passThrough401: true,
  })
  if (res.status === 404) throw new DeveloperNotFoundError(login)
  if (!res.ok) throw new Error(`Failed to fetch developer: ${res.status}`)
  return res.json()
}
