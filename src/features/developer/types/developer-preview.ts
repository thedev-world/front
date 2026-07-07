import type { MePlayerClass, MeXpProgress } from "@/features/auth/types/me"

export type DeveloperPreview = {
  github_login: string
  avatar_url: string | null
  xp_progress: MeXpProgress
  player_class: MePlayerClass
}
