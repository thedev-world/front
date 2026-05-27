import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { LevelConfig } from "@/features/onboarding/lib/xp-math";

export const xpConfigQueryKey = ["xp", "config"] as const;

async function loadXpConfig(): Promise<LevelConfig> {
  const res = await apiFetch("/api/v1/xp/config");
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = (await res.json()) as { level_thresholds: number[] };
  return { levelThresholds: data.level_thresholds };
}

/**
 * Fetches XP level thresholds from the backend.
 * Response: { level_thresholds: number[] }
 */
export function useXpConfig() {
  return useQuery({
    queryKey: xpConfigQueryKey,
    queryFn: loadXpConfig,
    staleTime: Infinity,
    retry: 3,
  });
}
