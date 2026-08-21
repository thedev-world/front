import {
  Box,
  GitCommit,
  GitFork,
  GitPullRequest,
  Lock,
  MessageSquare,
  Star,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { GitHubStatKey } from "./github-display-stats"

export const GITHUB_STAT_LUCIDE_ICONS: Record<GitHubStatKey, LucideIcon> = {
  commits: GitCommit,
  pullRequests: GitPullRequest,
  reviews: MessageSquare,
  privateActivity: Lock,
  stars: Star,
  followers: Users,
  forks: GitFork,
  repos: Box,
}
