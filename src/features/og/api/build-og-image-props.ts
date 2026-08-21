import { fetchPublicDeveloperServer } from "@/features/developer/api/public-developer-server"
import { resolveGitHubOgStats } from "@/features/developer/lib/github-display-stats"
import { getIslandLabel } from "@/features/onboarding/lib/island-image"
import { computeDeveloperRanks } from "@/features/planet/lib/compute-developer-ranks"
import type { OgImageProps } from "../types"
import { fetchPlanetData } from "./fetch-planet-data"
import { loadAppleIconSrc } from "../lib/load-apple-icon"
import { loadImageAsDataUrl } from "../lib/load-image"

type BuildResult =
  | { ok: true; props: OgImageProps }
  | { ok: false; status: number; message: string }

/** Server-side data assembly for OG image generation. No React Query, plain fetch. */
export async function buildOgImageProps(login: string): Promise<BuildResult> {
  const [user, planetData, appleIconSrc] = await Promise.all([
    fetchPublicDeveloperServer(login),
    fetchPlanetData(),
    loadAppleIconSrc(40),
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

  const avatarUrl = user.avatar_url
    ? await loadImageAsDataUrl(user.avatar_url)
    : null

  return {
    ok: true,
    props: {
      appleIconSrc,
      data: {
        login: user.github_login,
        avatarUrl,
        islandLabel: getIslandLabel(islandId) ?? islandId,
        level: user.xp_progress.level,
        cellCount: user.cell_count,
        className: user.player_class.name,
        islandRank,
        globalRank,
        githubStats: resolveGitHubOgStats(user),
      },
    },
  }
}
