"use client"

import { useEnrichedPlanetData } from "../api/use-enriched-planet-data"
import { usePlanetStore } from "../stores/planet-store"

export function TerritoryHoverCard() {
  const { data: snapshot } = useEnrichedPlanetData()
  const { hoveredTerritoryIndex, mousePos } = usePlanetStore()

  if (hoveredTerritoryIndex === null || !snapshot) return null

  const territory = snapshot.territories[hoveredTerritoryIndex]
  if (!territory) return null

  const island = snapshot.islands.find((i) => i.id === territory.islandId)

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-lg border border-white/10 bg-zinc-950/95 px-3 py-2 shadow-xl"
      style={{
        left: mousePos.x + 14,
        top: mousePos.y + 14,
      }}
    >
      <p className="text-sm font-medium text-white">{territory.login}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
        {island && (
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: island.color }}
            />
            {island.name} island
          </span>
        )}
        <span>·</span>
        <span>{territory.cellCount} cells</span>
      </div>
    </div>
  )
}
