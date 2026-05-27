"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { IslandOption } from "../types/island";

export const islandsQueryKey = ["onboarding", "islands"] as const;

async function loadIslands(): Promise<IslandOption[]> {
  const res = await apiFetch("/api/v1/onboarding/islands");
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = (await res.json()) as { islands: IslandOption[] };
  return data.islands;
}

export function useIslands() {
  return useQuery({
    queryKey: islandsQueryKey,
    queryFn: loadIslands,
    staleTime: Infinity,
  });
}
