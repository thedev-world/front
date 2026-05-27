export type PlayerClassSlug =
  | "seedling"
  | "crafter"
  | "builder"
  | "maintainer"
  | "architect"
  | "founder"
  | "sovereign"
  | "legend";

export type PlayerClassMeta = {
  slug: PlayerClassSlug;
  name: string;
  tier: number;
  requiredLevel: number;
  badge: string;
  phrase: string;
};

/** Badge paths are UI-only assets. */
export const BADGE_BY_SLUG: Record<PlayerClassSlug, string> = {
  seedling:   "/images/ranking-badges/seedling-badge.png",
  builder:    "/images/ranking-badges/builder-badge.png",
  crafter:    "/images/ranking-badges/crafter-badge.png",
  architect:  "/images/ranking-badges/architect-badge.png",
  maintainer: "/images/ranking-badges/maintainer-badge.png",
  legend:     "/images/ranking-badges/legend-badge.png",
  sovereign:  "/images/ranking-badges/sovereign-badge.png",
  founder:    "/images/ranking-badges/founder-badge.png",
};

/** Fallback used in loading states and SSR. */
export const PLAYER_CLASS_FALLBACK: PlayerClassMeta = {
  slug: "seedling",
  name: "Seedling",
  tier: 1,
  requiredLevel: 1,
  badge: BADGE_BY_SLUG.seedling,
  phrase: "It compiles. That's something.",
};

export function resolvePlayerClass(
  name: string | undefined,
  classes: PlayerClassMeta[],
): PlayerClassMeta {
  if (!name) return PLAYER_CLASS_FALLBACK;
  const key = name.trim().toLowerCase() as PlayerClassSlug;
  return classes.find((c) => c.slug === key) ?? PLAYER_CLASS_FALLBACK;
}

export function nextPlayerClass(
  name: string,
  classes: PlayerClassMeta[],
): PlayerClassMeta | null {
  const current = resolvePlayerClass(name, classes);
  return classes.find((c) => c.tier === current.tier + 1) ?? null;
}

