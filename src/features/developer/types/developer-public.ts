import type { DeveloperPreview } from "./developer-preview"

export type DeveloperPublicProfile = DeveloperPreview & {
  id: string
  github_id: number
  commits_alltime: number
  commits_breakdown_sum: number
  commits_farm_flagged: boolean
  commits_farm_cleared: boolean
  prs_contributions_alltime: number
  reviews_alltime: number
  private_contributions_alltime: number
  forks_received: number
  followers: number
  stars_received_raw: number
  stars_received_capped: number
  owned_non_fork_repos_count: number
  account_created_at: string
  xp_brut: number
  cell_count: number
  island: string | null
  is_onboarded: boolean
  last_sync_at: string | null
  next_sync_at: string | null
  created_at: string
  updated_at: string
}
