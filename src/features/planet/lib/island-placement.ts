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
 * BFS flood-fill to grow territories within an island.
 * Each developer starts from a seed cell and grows outward.
 * Territories cannot overlap.
 */
function growTerritories(
  developers: { login: string; cellCount: number }[],
  islandId: string,
): { territories: Territory[]; totalCells: number } {
  const occupied = new Set<string>()
  const territories: Territory[] = []

  // Sort by cell count descending so largest territories seed first (better packing)
  const sorted = [...developers].sort((a, b) => b.cellCount - a.cellCount)

  // Spiral seed placement: place each dev's seed progressively outward
  let seedRing = 0
  let seedIndex = 0

  for (const dev of sorted) {
    // Find a free seed cell
    const seed = findFreeSeed(occupied, seedRing)
    seedRing = Math.floor(Math.sqrt(seedIndex + 1))
    seedIndex++

    // BFS growth from seed
    const cells = bfsGrow(seed, dev.cellCount, occupied)
    cells.forEach((c) => occupied.add(hexKey(c.q, c.r)))

    territories.push({
      login: dev.login,
      islandId,
      cellCount: dev.cellCount,
      cells,
    })
  }

  return { territories, totalCells: occupied.size }
}

function findFreeSeed(
  occupied: Set<string>,
  startRing: number,
): HexCell {
  // Spiral outward from center to find first free cell
  if (!occupied.has(hexKey(0, 0))) return { q: 0, r: 0 }

  for (let ring = startRing; ring < 100; ring++) {
    const cells = hexRing(ring)
    for (const cell of cells) {
      if (!occupied.has(hexKey(cell.q, cell.r))) return cell
    }
  }
  // Fallback
  return { q: startRing + 50, r: 0 }
}

function hexRing(ring: number): HexCell[] {
  if (ring === 0) return [{ q: 0, r: 0 }]

  const results: HexCell[] = []
  let q = ring
  let r = 0

  for (let dir = 0; dir < 6; dir++) {
    for (let step = 0; step < ring; step++) {
      results.push({ q, r })
      const [dq, dr] = HEX_DIRECTIONS[(dir + 2) % 6]
      q += dq
      r += dr
    }
  }
  return results
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
      name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " "),
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
