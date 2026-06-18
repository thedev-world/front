import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

export type PlanetConfig = {
  developerGoal: number;
};

export const planetConfigQueryKey = ["planet", "config"] as const;

async function loadPlanetConfig(): Promise<PlanetConfig> {
  const res = await apiFetch("/api/v1/planet/config");
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = (await res.json()) as { developer_goal: number };
  return { developerGoal: data.developer_goal };
}

export function usePlanetConfig() {
  return useQuery({
    queryKey: planetConfigQueryKey,
    queryFn: loadPlanetConfig,
    staleTime: Infinity,
  });
}
