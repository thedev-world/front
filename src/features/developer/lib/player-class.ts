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
  seedling:   "/images/ranking-badges/seedling-badge.webp",
  builder:    "/images/ranking-badges/builder-badge.webp",
  crafter:    "/images/ranking-badges/crafter-badge.webp",
  architect:  "/images/ranking-badges/architect-badge.webp",
  maintainer: "/images/ranking-badges/maintainer-badge.webp",
  legend:     "/images/ranking-badges/legend-badge.webp",
  sovereign:  "/images/ranking-badges/sovereign-badge.webp",
  founder:    "/images/ranking-badges/founder-badge.webp",
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

/** Progress [0, 1] along the rank rail based on level between tier thresholds. */
export function computeRankSpineProgress(
  playerLevel: number,
  current: PlayerClassMeta,
  classes: PlayerClassMeta[],
): number {
  const n = classes.length;
  const next = classes.find((c) => c.tier === current.tier + 1);
  if (!next) return 1;

  const segmentProgress = Math.min(
    1,
    Math.max(
      0,
      (playerLevel - current.requiredLevel) /
        (next.requiredLevel - current.requiredLevel),
    ),
  );
  return Math.min(1, (current.tier - 1 + segmentProgress) / Math.max(1, n - 1));
}

/**
 * Loads a badge image and waits for full decode so it paints instantly on display.
 * Uses the same static URL as BadgeGlow with unoptimized, shares the HTTP cache.
 */
export async function preloadBadgeImage(src: string): Promise<void> {
  if (typeof window === "undefined" || !src) return;

  const img = new Image();
  img.decoding = "async";
  img.src = src;

  if (!img.complete) {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load ${src}`));
    });
  }

  await img.decode();
}

