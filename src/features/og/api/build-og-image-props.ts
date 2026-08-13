import { fetchPublicDeveloperServer } from "@/features/developer/api/public-developer-server"
import { getIslandLabel } from "@/features/onboarding/lib/island-image"
import { computeDeveloperRanks } from "@/features/planet/lib/compute-developer-ranks"
import type { OgImageProps } from "../types"
import { fetchPlanetData } from "./fetch-planet-data"
import { loadImageAsDataUrl } from "../lib/load-image"

type BuildResult =
  | { ok: true; props: OgImageProps }
  | { ok: false; status: number; message: string }

/** Server-side data assembly for OG image generation. No React Query, plain fetch. */
export async function buildOgImageProps(login: string): Promise<BuildResult> {
  const captureBase = (process.env.PLANET_CAPTURE_BASE_URL ?? "").replace(/\/$/, "")

  const [user, planetData] = await Promise.all([
    fetchPublicDeveloperServer(login),
    fetchPlanetData(),
  ])

  if (!user) {
    return { ok: false, status: 404, message: "Developer not found" }
  }

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
