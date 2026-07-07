import type { MeXpProgress } from "./me";

export type SyncXpBreakdownDelta = {
  commits: number;
  pull_requests: number;
  reviews: number;
  stars: number;
  forks: number;
  followers: number;
  tenure_years_bonus: number;
};

export type SyncProgress = {
  xp_before: number;
  xp_after: number;
  level_before: number;
  level_after: number;
  cell_before: number;
  cell_after: number;
  xp_progress_before: MeXpProgress;
  xp_progress_after: MeXpProgress;
  breakdown_delta: SyncXpBreakdownDelta;
};

export type MeSyncCooldownResponse = {
  sync_performed: false;
  cooldown_active: true;
  retry_after: string;
};

export type MeSyncPerformedResponse = {
  sync_performed: true;
  first_sync: boolean;
  progress: SyncProgress | null;
};

export type MeSyncResponse = MeSyncCooldownResponse | MeSyncPerformedResponse;

