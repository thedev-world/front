export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
  planetJsonUrl: process.env.NEXT_PUBLIC_PLANET_JSON_URL || "/api/v1/planet",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://thedev.world",
} as const

/**
 * Internal backend origin for server-side fetches (SSR, generateMetadata, route handlers).
 * Not for the browser, clients go through same-origin `/api` rewrites.
 */
export function getBackendUrl(): string {
  return (process.env.BACKEND_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")
}
