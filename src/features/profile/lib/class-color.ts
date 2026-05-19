export const CLASS_TERRITORY_COLORS: Record<string, string> = {
  Seedling:   "#2d6a4f",
  Builder:    "#1d6fa4",
  Crafter:    "#5c4b8a",
  Architect:  "#b8860b",
  Maintainer: "#c47c1a",
  Legend:     "#e05c1a",
  Sovereign:  "#8b1a1a",
  Founder:    "#4a0080",
};

const FALLBACK_COLOR = "#1d6fa4";

export function getClassColor(className: string): string {
  return CLASS_TERRITORY_COLORS[className] ?? FALLBACK_COLOR;
}
