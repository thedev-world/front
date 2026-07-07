"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import {
  BADGE_BY_SLUG,
  type PlayerClassMeta,
  type PlayerClassSlug,
} from "@/features/developer/lib/player-class";

export const playerClassesQueryKey = ["xp", "classes"] as const;

type ApiPlayerClassItem = {
  slug: string;
  name: string;
  tier: number;
  required_level: number;
  phrase: string;
};

async function loadPlayerClasses(): Promise<PlayerClassMeta[]> {
  const res = await apiFetch("/api/v1/xp/classes");
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = (await res.json()) as ApiPlayerClassItem[];
  return data.map((item) => ({
    slug: item.slug as PlayerClassSlug,
    name: item.name,
    tier: item.tier,
    requiredLevel: item.required_level,
    phrase: item.phrase,
    badge: BADGE_BY_SLUG[item.slug as PlayerClassSlug] ?? "",
  }));
}

export function usePlayerClasses() {
  return useQuery({
    queryKey: playerClassesQueryKey,
    queryFn: loadPlayerClasses,
    staleTime: Infinity,
    retry: 3,
  });
}
