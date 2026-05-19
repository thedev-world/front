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
};

const PLAYER_CLASSES: Record<PlayerClassSlug, PlayerClassMeta> = {
  seedling: {
    slug: "seedling",
    name: "Seedling",
    tier: 1,
    requiredLevel: 1,
    badge: "/images/ranking-badges/seedling-badge.png",
  },
  builder: {
    slug: "builder",
    name: "Builder",
    tier: 2,
    requiredLevel: 5,
    badge: "/images/ranking-badges/builder-badge.png",
  },
  crafter: {
    slug: "crafter",
    name: "Crafter",
    tier: 3,
    requiredLevel: 10,
    badge: "/images/ranking-badges/crafter-badge.png",
  },
  architect: {
    slug: "architect",
    name: "Architect",
    tier: 4,
    requiredLevel: 20,
    badge: "/images/ranking-badges/architect-badge.png",
  },
  maintainer: {
    slug: "maintainer",
    name: "Maintainer",
    tier: 5,
    requiredLevel: 35,
    badge: "/images/ranking-badges/maintainer-badge.png",
  },
  legend: {
    slug: "legend",
    name: "Legend",
    tier: 6,
    requiredLevel: 55,
    badge: "/images/ranking-badges/legend-badge.png",
  },
  sovereign: {
    slug: "sovereign",
    name: "Sovereign",
    tier: 7,
    requiredLevel: 80,
    badge: "/images/ranking-badges/sovereign-badge.png",
  },
  founder: {
    slug: "founder",
    name: "Founder",
    tier: 8,
    requiredLevel: 100,
    badge: "/images/ranking-badges/founder-badge.png",
  },
};

export const PLAYER_CLASS_ORDER: PlayerClassMeta[] = Object.values(
  PLAYER_CLASSES,
).sort((a, b) => a.tier - b.tier);

const FALLBACK = PLAYER_CLASSES.seedling;

export function resolvePlayerClass(name: string | undefined): PlayerClassMeta {
  const key = name?.trim().toLowerCase() as PlayerClassSlug | undefined;
  if (!key) return FALLBACK;
  return PLAYER_CLASSES[key] ?? FALLBACK;
}

export function nextPlayerClass(name: string): PlayerClassMeta | null {
  const current = resolvePlayerClass(name);
  return (
    PLAYER_CLASS_ORDER.find((c) => c.tier === current.tier + 1) ?? null
  );
}
