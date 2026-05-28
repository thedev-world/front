export type MeXpProgress = {
  level: number;
  xp_in_level: number;
  xp_needed: number;
  percent: number;
};

export type MePlayerClass = {
  name: string;
  phrase: string;
};

export type MeProfile = {
  id: string;
  github_id: number;
  github_login: string;
  commits_alltime: number;
  prs_contributions_alltime: number;
  reviews_alltime: number;
  forks_received: number;
  followers: number;
  stars_received_raw: number;
  stars_received_capped: number;
  owned_non_fork_repos_count: number;
  account_created_at: string;
  xp_brut: number;
  xp_progress: MeXpProgress;
  cell_count: number;
  player_class: MePlayerClass;
  island: string | null;
  is_onboarded: boolean;
  last_sync_at: string;
  next_sync_at: string | null;
  created_at: string;
  updated_at: string;
};
