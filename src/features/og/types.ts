import type { ResolvedGitHubStat } from "@/features/developer/lib/github-display-stats"

export type OgCardData = {
  login: string
  avatarUrl: string | null
  islandLabel: string
  level: number
  cellCount: number
  className: string
  islandRank: number
  globalRank: number
  githubStats: ResolvedGitHubStat[]
}

export type OgImageProps = {
  data: OgCardData
  appleIconSrc: string | null
}

export type OgGithubStatIcon = "commit" | "pr" | "review" | "private" | "star"

export type OgGithubStat = {
  value: number
  label: string
  icon: OgGithubStatIcon
}
