/**
 * Returns the public image path for a given island slug, or null if no island.
 * Pattern: /images/islands/{slug}-islands.webp
 */
export function getIslandImagePath(island: string | null | undefined): string | null {
  if (!island) return null;
  return `/images/islands/${island}-islands.webp`;
}

/**
 * Loads an island badge and waits for full decode so it paints instantly on display.
 * Uses the same static URL as BadgeGlow with unoptimized — shares the HTTP cache.
 */
export async function preloadIslandImage(slug: string): Promise<void> {
  const src = getIslandImagePath(slug);
  if (!src) return;

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
