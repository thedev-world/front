import type { DeveloperPublicProfile } from "@/features/developer/types/developer-public"
import { getIslandLabel } from "@/features/onboarding/lib/island-image"
import { computeDeveloperRanks } from "@/features/planet/lib/compute-developer-ranks"
import type { PlanetApiResponse } from "@/features/planet/types/snapshot"
import type { OgImageProps } from "../types"

type BuildResult =
  | { ok: true; props: OgImageProps }
  | { ok: false; status: number; message: string }

function backendUrl(): string {
  return (process.env.BACKEND_URL ?? "http://api:8000").replace(/\/$/, "")
}

function planetJsonUrl(base: string): string {
  const direct = (process.env.PLANET_JSON_URL ?? "").replace(/\/$/, "")
  return direct || `${base}/api/v1/planet`
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const mime = res.headers.get("content-type") ?? "image/jpeg"
    return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`
  } catch {
    return null
  }
}

/** Server-side data assembly for OG image generation. No React Query, plain fetch. */
export async function buildOgImageProps(login: string): Promise<BuildResult> {
  const base = backendUrl()
  const captureBase = (process.env.PLANET_CAPTURE_BASE_URL ?? "").replace(/\/$/, "")

  const [userRes, planetRes] = await Promise.all([
    fetch(`${base}/api/v1/user/${encodeURIComponent(login)}`),
    fetch(planetJsonUrl(base)),
  ])

  if (!userRes.ok) {
    return {
      ok: false,
      status: userRes.status === 404 ? 404 : 502,
      message: userRes.status === 404 ? "Developer not found" : "Failed to fetch user",
    }
  }

  const user: DeveloperPublicProfile = await userRes.json()
  const planetData: PlanetApiResponse = planetRes.ok ? await planetRes.json() : { updated_at: "", islands: {} }

  const islandId = user.island ?? ""
  const { islandRank, globalRank } = computeDeveloperRanks(
    planetData,
    user.github_login,
    islandId,
  )

  const captureUrl = captureBase ? `${captureBase}/captures/${user.github_login}.jpg` : null
  const [planetImageSrc, avatarUrl] = await Promise.all([
    captureUrl ? loadImageAsDataUrl(captureUrl) : Promise.resolve(null),
    user.avatar_url ? loadImageAsDataUrl(user.avatar_url) : Promise.resolve(null),
  ])

  return {
    ok: true,
    props: {
      planetImageSrc,
      data: {
        login: user.github_login,
        avatarUrl,
        islandLabel: getIslandLabel(islandId) ?? islandId,
        level: user.xp_progress.level,
        xpPercent: user.xp_progress.percent,
        cellCount: user.cell_count,
        className: user.player_class.name,
        islandRank,
        globalRank,
      },
    },
  }
}
