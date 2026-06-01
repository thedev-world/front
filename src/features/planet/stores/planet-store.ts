import { create } from "zustand"

type MousePos = { x: number; y: number }

type PlanetStore = {
  hoveredTerritoryIndex: number | null
  mousePos: MousePos
  setHoveredTerritory: (index: number | null) => void
  setMousePos: (pos: MousePos) => void
}

export const usePlanetStore = create<PlanetStore>((set) => ({
  hoveredTerritoryIndex: null,
  mousePos: { x: 0, y: 0 },
  setHoveredTerritory: (hoveredTerritoryIndex) => set({ hoveredTerritoryIndex }),
  setMousePos: (mousePos) => set({ mousePos }),
}))
