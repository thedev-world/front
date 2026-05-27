/**
 * Returns the public image path for a given island slug, or null if no island.
 * Pattern: /images/islands/{slug}-islands.png
 */
export function getIslandImagePath(island: string | null | undefined): string | null {
  if (!island) return null;
  return `/images/islands/${island}-islands.png`;
}

/**
 * Prettifies an island slug into a human-readable label.
 * e.g. "open_source" → "Open Source", "indie_hacker" → "Indie Hacker"
 */
export function getIslandLabel(island: string | null | undefined): string | null {
  if (!island) return null;
  return island
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
