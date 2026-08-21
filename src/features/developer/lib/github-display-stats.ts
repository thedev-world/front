export type GitHubStatsSource = {
  commits_alltime: number
  prs_contributions_alltime: number
  reviews_alltime: number
  private_contributions_alltime: number
  stars_received_raw: number
  followers: number
  forks_received: number
  owned_non_fork_repos_count: number
}

export type GitHubStatKey =
  | "commits"
  | "pullRequests"
  | "reviews"
  | "privateActivity"
  | "stars"
  | "followers"
  | "forks"
  | "repos"

export type GitHubStatDefinition = {
  key: GitHubStatKey
  label: string
  ogLabel?: string
  getValue: (source: GitHubStatsSource) => number
}

export type ResolvedGitHubStat = {
  key: GitHubStatKey
  label: string
  value: number
}

export const GITHUB_PROFILE_STATS: readonly GitHubStatDefinition[] = [
  {
    key: "commits",
    label: "Commits",
    getValue: (s) => s.commits_alltime,
  },
  {
    key: "pullRequests",
    label: "Pull Requests",
    getValue: (s) => s.prs_contributions_alltime,
  },
  {
    key: "reviews",
    label: "Reviews",
    getValue: (s) => s.reviews_alltime,
  },
  {
    key: "privateActivity",
    label: "PV activity",
    ogLabel: "Private activity",
    getValue: (s) => s.private_contributions_alltime,
  },
  {
    key: "stars",
    label: "Stars",
    getValue: (s) => s.stars_received_raw,
  },
  {
    key: "followers",
    label: "Followers",
    getValue: (s) => s.followers,
  },
  {
    key: "forks",
    label: "Forks",
    getValue: (s) => s.forks_received,
  },
  {
    key: "repos",
    label: "Repos",
    getValue: (s) => s.owned_non_fork_repos_count,
  },
] as const

export const GITHUB_OG_STAT_KEYS: readonly GitHubStatKey[] = [
  "commits",
  "pullRequests",
  "reviews",
  "privateActivity",
  "stars",
] as const

const GITHUB_STAT_BY_KEY = Object.fromEntries(
  GITHUB_PROFILE_STATS.map((def) => [def.key, def]),
) as Record<GitHubStatKey, GitHubStatDefinition>

export function resolveGitHubStats(
  source: GitHubStatsSource,
  defs: readonly GitHubStatDefinition[] = GITHUB_PROFILE_STATS,
): ResolvedGitHubStat[] {
  return defs.map((def) => ({
    key: def.key,
    label: def.label,
    value: def.getValue(source),
  }))
}

export function resolveGitHubOgStats(source: GitHubStatsSource): ResolvedGitHubStat[] {
  return GITHUB_OG_STAT_KEYS.map((key) => {
    const def = GITHUB_STAT_BY_KEY[key]
    return {
      key,
      label: def.ogLabel ?? def.label,
      value: def.getValue(source),
    }
  }).filter((stat) => stat.value > 0)
}
