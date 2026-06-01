/**
 * Island placement on the sphere + BFS territory growth.
 *
 * 1. Fibonacci sphere: distributes island anchors uniformly
 * 2. BFS flood-fill: grows each developer's territory outward from a seed,
 *    guaranteeing contiguity (no holes within a territory)
 * 3. Dynamic cellSize: computed so total cells fit on the sphere without overlap
 */

import type {
  HexCell,
  Island,
  PlanetApiResponse,
  PlanetSnapshot,
  Territory,
} from "../types/snapshot"
import { HEX_DIRECTIONS, hexKey } from "./hex-grid"

// Palette of rich, distinct colors per island type
const ISLAND_COLORS: Record<string, string> = {
  frontend: "#f472b6", // pink
  backend: "#60a5fa", // blue
  "ai-ml": "#a78bfa", // purple
  devops: "#fb923c", // orange
  mobile: "#34d399", // emerald
  "open-source": "#fbbf24", // amber
  data: "#2dd4bf", // teal
  indie: "#f87171", // red
  security: "#818cf8", // indigo
  gaming: "#e879f9", // fuchsia
}

function getIslandColor(id: string): string {
  if (ISLAND_COLORS[id]) return ISLAND_COLORS[id]
  // Deterministic fallback based on string hash
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = ((hash % 360) + 360) % 360
  return `hsl(${h}, 70%, 60%)`
}

/**
 * Fibonacci sphere: place N points roughly uniformly on a sphere.
 * Returns [phi, theta] pairs in Three.js spherical convention.
 */
function fibonacciSphereAnchors(n: number): [number, number][] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const anchors: [number, number][] = []

  for (let i = 0; i < n; i++) {
    // y goes from ~1 to ~-1
    const y = 1 - (2 * (i + 0.5)) / n
    const angle = goldenAngle * i

    // Convert to spherical (phi = polar from +Y, theta = azimuthal)
    const phi = Math.acos(y)
    const theta = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

    // Avoid extreme poles (they look odd with flat hexes)
    if (phi > 0.3 && phi < Math.PI - 0.3) {
      anchors.push([phi, theta])
    }
  }

  // If we filtered too many, just return first n from unfiltered
  if (anchors.length < n) {
    const all: [number, number][] = []
    for (let i = 0; i < n * 2; i++) {
      const y = 1 - (2 * (i + 0.5)) / (n * 2)
      const angle = goldenAngle * i
      const phi = Math.acos(Math.max(-1, Math.min(1, y)))
      const theta = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      all.push([phi, theta])
    }
    return all.slice(0, n)
  }

  return anchors.slice(0, n)
}

/**
 * Sequential additive territory growth.
 *
 * Each developer is placed in API order (stable across updates).
 * Each territory seeds on the frontier of the existing mass, then BFS-grows
 * outward. This guarantees:
 * - No holes (every territory touches the existing mass)
 * - No starvation (infinite hex grid = always room outward)
 * - Stability (a dev's position only depends on devs placed before them)
 */
function growTerritories(
  developers: { login: string; cellCount: number }[],
  islandId: string,
): { territories: Territory[]; totalCells: number } {
  const occupied = new Set<string>()
  const territories: Territory[] = []

  // Track the frontier of the entire occupied mass
  // (free cells adjacent to at least one occupied cell)
  const massFrontier = new Set<string>()

  for (let i = 0; i < developers.length; i++) {
    const dev = developers[i]

    // First dev seeds at center; subsequent devs seed on the mass frontier
    let seed: HexCell
    if (i === 0) {
      seed = { q: 0, r: 0 }
    } else {
      seed = pickBestFrontierSeed(massFrontier, occupied)
    }

    // BFS growth from seed
    const cells = bfsGrow(seed, dev.cellCount, occupied)

    // Mark cells as occupied and update mass frontier
    for (const c of cells) {
      const key = hexKey(c.q, c.r)
      occupied.add(key)
      massFrontier.delete(key) // no longer free

      // Add this cell's free neighbors to the mass frontier
      for (const [dq, dr] of HEX_DIRECTIONS) {
        const nKey = hexKey(c.q + dq, c.r + dr)
        if (!occupied.has(nKey)) {
          massFrontier.add(nKey)
        }
      }
    }

    territories.push({
      login: dev.login,
      islandId,
      cellCount: dev.cellCount,
      cells,
    })
  }

  return { territories, totalCells: occupied.size }
}

/**
 * Pick the best seed from the mass frontier.
 * Prefers cells closest to the center (keeps island compact).
 */
function pickBestFrontierSeed(
  massFrontier: Set<string>,
  occupied: Set<string>,
): HexCell {
  let bestCell: HexCell = { q: 0, r: 0 }
  let bestDist = Infinity

  for (const key of massFrontier) {
    if (occupied.has(key)) continue
    const [q, r] = key.split(",").map(Number)
    // Axial distance from center
    const dist = (Math.abs(q) + Math.abs(q + r) + Math.abs(r)) / 2
    if (dist < bestDist) {
      bestDist = dist
      bestCell = { q, r }
    }
  }

  return bestCell
}


function bfsGrow(
  seed: HexCell,
  count: number,
  occupied: Set<string>,
): HexCell[] {
  const cells: HexCell[] = [seed]
  // Cells actually added to the territory
  const inTerritory = new Set<string>([hexKey(seed.q, seed.r)])
  // All cells we've seen (territory + frontier) to avoid duplicates
  const visited = new Set<string>([hexKey(seed.q, seed.r)])

  // Frontier as a Map: key → {q, r, neighbors in territory}
  const frontierMap = new Map<string, { q: number; r: number; neighbors: number }>()

  // Initialize frontier with seed's free neighbors
  for (const [dq, dr] of HEX_DIRECTIONS) {
    const nq = seed.q + dq
    const nr = seed.r + dr
    const key = hexKey(nq, nr)
    if (!occupied.has(key) && !visited.has(key)) {
      frontierMap.set(key, { q: nq, r: nr, neighbors: 1 })
      visited.add(key)
    }
  }

  // Seeded random for slight organic variation among equal candidates
  let rngState = Math.abs(seed.q * 127 + seed.r * 311 + count * 73) + 1
  const rng = () => {
    rngState = (rngState * 16807) % 2147483647
    return (rngState - 1) / 2147483646
  }

  // Track recently added cells for directional growth bias
  const recentCells: string[] = [hexKey(seed.q, seed.r)]
  const RECENT_WINDOW = 6

  while (cells.length < count && frontierMap.size > 0) {
    // DLA-like growth: prefer frontier cells adjacent to RECENT additions
    // This creates directional branching instead of radial hexagonal blobs
    const chaos = rng()
    let pickKey: string

    if (chaos < 0.25) {
      // 25%: compact fill to prevent disconnection
      let maxNeighbors = 0
      for (const entry of frontierMap.values()) {
        if (entry.neighbors > maxNeighbors) maxNeighbors = entry.neighbors
      }
      const candidates: string[] = []
      for (const [key, entry] of frontierMap) {
        if (entry.neighbors >= maxNeighbors) candidates.push(key)
      }
      pickKey = candidates[Math.floor(rng() * candidates.length)]
    } else {
      // 75%: grow from the "tips" — pick frontier cells adjacent to recent additions
      const recentSet = new Set(recentCells.slice(-RECENT_WINDOW))
      const tipCandidates: string[] = []

      for (const [key, entry] of frontierMap) {
        // Check if this frontier cell is adjacent to any recent cell
        let isNearRecent = false
        for (const [dq, dr] of HEX_DIRECTIONS) {
          if (recentSet.has(hexKey(entry.q + dq, entry.r + dr))) {
            isNearRecent = true
            break
          }
        }
        if (isNearRecent) tipCandidates.push(key)
      }

      if (tipCandidates.length > 0) {
        pickKey = tipCandidates[Math.floor(rng() * tipCandidates.length)]
      } else {
        // Fallback: any frontier cell
        const all = Array.from(frontierMap.keys())
        pickKey = all[Math.floor(rng() * all.length)]
      }
    }

    const picked = frontierMap.get(pickKey)!
    frontierMap.delete(pickKey)
    cells.push({ q: picked.q, r: picked.r })
    inTerritory.add(pickKey)
    recentCells.push(pickKey)

    // Update frontier: increment neighbor counts for existing frontier cells
    // adjacent to the newly added cell, and discover new frontier cells
    for (const [dq, dr] of HEX_DIRECTIONS) {
      const nq = picked.q + dq
      const nr = picked.r + dr
      const key = hexKey(nq, nr)

      if (occupied.has(key)) continue

      if (frontierMap.has(key)) {
        // Already in frontier — increment its neighbor count
        frontierMap.get(key)!.neighbors++
      } else if (!visited.has(key)) {
        // New frontier cell — count only actual territory neighbors
        let nCount = 0
        for (const [ddq, ddr] of HEX_DIRECTIONS) {
          if (inTerritory.has(hexKey(nq + ddq, nr + ddr))) nCount++
        }
        frontierMap.set(key, { q: nq, r: nr, neighbors: nCount })
        visited.add(key)
      }
    }
  }

  return cells
}

/**
 * Compute appropriate cellSize so territories don't overflow the sphere.
 * Approximation: total hex area should cover at most ~40% of sphere surface.
 */
function computeCellSize(totalCells: number): number {
  const sphereSurfaceArea = 4 * Math.PI * 25 // PLANET_RADIUS^2 = 25
  const maxCoverage = 0.35
  const availableArea = sphereSurfaceArea * maxCoverage
  // Each hex cell area ≈ (3√3/2) * cellSize^2
  const hexArea = (3 * Math.sqrt(3)) / 2
  const targetCellArea = availableArea / Math.max(totalCells, 1)
  const cs = Math.sqrt(targetCellArea / hexArea)
  // Clamp between reasonable bounds
  return Math.max(0.04, Math.min(0.25, cs))
}

/**
 * Main entry: transforms API response into a PlanetSnapshot ready for rendering.
 */
export function buildPlanetSnapshot(
  apiResponse: PlanetApiResponse,
): PlanetSnapshot {
  const islandIds = Object.keys(apiResponse.islands)
  const anchors = fibonacciSphereAnchors(islandIds.length)

  let allTerritories: Territory[] = []
  let grandTotalCells = 0

  const islands: Island[] = islandIds.map((id, i) => {
    const devs = apiResponse.islands[id].map(([login, cellCount]) => ({
      login,
      cellCount,
    }))
    const { territories, totalCells } = growTerritories(devs, id)
    allTerritories = allTerritories.concat(territories)
    grandTotalCells += totalCells

    return {
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1).replace(/[-_]/g, " "),
      anchor: anchors[i] || [Math.PI / 2, (i * Math.PI * 2) / islandIds.length],
      color: getIslandColor(id),
      cellCount: totalCells,
    }
  })

  const cellSize = computeCellSize(grandTotalCells)

  return {
    version: apiResponse.updated_at,
    cellSize,
    islands,
    territories: allTerritories,
  }
}
