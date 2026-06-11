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
import { HEX_DIRECTIONS, hexKey, hexToLocal } from "./hex-grid"
import { BASE_PLANET_RADIUS } from "./planet-projection"

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
      seed = pickBestFrontierSeed(massFrontier, occupied, dev.cellCount)
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

  // Post-processing: fill interior holes (cells surrounded on 5-6 sides)
  // Assign them to the neighboring territory with the most adjacent cells
  const cellOwner = new Map<string, number>()
  territories.forEach((t, idx) => {
    t.cells.forEach((c) => cellOwner.set(hexKey(c.q, c.r), idx))
  })

  let changed = true
  while (changed) {
    changed = false
    for (const key of massFrontier) {
      if (occupied.has(key)) continue
      const [q, r] = key.split(",").map(Number)
      let occupiedCount = 0
      const neighborOwners = new Map<number, number>()
      for (const [dq, dr] of HEX_DIRECTIONS) {
        const nKey = hexKey(q + dq, r + dr)
        if (occupied.has(nKey)) {
          occupiedCount++
          const owner = cellOwner.get(nKey)
          if (owner !== undefined) {
            neighborOwners.set(owner, (neighborOwners.get(owner) || 0) + 1)
          }
        }
      }
      // Only fill if surrounded on 5+ sides
      if (occupiedCount >= 5 && neighborOwners.size > 0) {
        let bestOwner = 0
        let bestCount = 0
        for (const [owner, count] of neighborOwners) {
          if (count > bestCount) { bestCount = count; bestOwner = owner }
        }
        const cell: HexCell = { q, r }
        territories[bestOwner].cells.push(cell)
        cellOwner.set(key, bestOwner)
        occupied.add(key)
        massFrontier.delete(key)
        // Update frontier
        for (const [dq, dr] of HEX_DIRECTIONS) {
          const nKey = hexKey(q + dq, r + dr)
          if (!occupied.has(nKey)) massFrontier.add(nKey)
        }
        changed = true
      }
    }
  }

  return { territories, totalCells: occupied.size }
}

/**
 * Pick the best seed from the mass frontier.
 * Ensures the seed has enough reachable free cells for the territory to grow.
 * Among valid seeds, prefers those closer to center (compact island shape).
 */
function pickBestFrontierSeed(
  massFrontier: Set<string>,
  occupied: Set<string>,
  cellsNeeded: number,
): HexCell {
  // Build candidate list sorted by distance to center
  const candidates: { q: number; r: number; dist: number }[] = []
  for (const key of massFrontier) {
    if (occupied.has(key)) continue
    const [q, r] = key.split(",").map(Number)
    const dist = (Math.abs(q) + Math.abs(q + r) + Math.abs(r)) / 2
    candidates.push({ q, r, dist })
  }
  candidates.sort((a, b) => a.dist - b.dist)

  // For each candidate (closest first), check if it has enough reachable cells
  for (const c of candidates) {
    const reachable = countReachable(c.q, c.r, occupied, cellsNeeded)
    if (reachable >= cellsNeeded) return { q: c.q, r: c.r }
  }

  // Fallback: pick the one with the most reachable cells
  let bestCell: HexCell = { q: candidates[0]?.q ?? 0, r: candidates[0]?.r ?? 0 }
  let bestReachable = 0
  // Only check a subset to avoid O(n²) on huge frontiers
  const toCheck = candidates.slice(0, Math.min(candidates.length, 50))
  for (const c of toCheck) {
    const reachable = countReachable(c.q, c.r, occupied, cellsNeeded)
    if (reachable > bestReachable) {
      bestReachable = reachable
      bestCell = { q: c.q, r: c.r }
    }
  }
  return bestCell
}

/**
 * Count how many free cells are reachable from (q, r) via BFS,
 * stopping early once we reach `limit`.
 */
function countReachable(
  q: number,
  r: number,
  occupied: Set<string>,
  limit: number,
): number {
  const visited = new Set<string>([hexKey(q, r)])
  const queue: [number, number][] = [[q, r]]
  let count = 1

  while (queue.length > 0 && count < limit) {
    const [cq, cr] = queue.shift()!
    for (const [dq, dr] of HEX_DIRECTIONS) {
      const nq = cq + dq
      const nr = cr + dr
      const key = hexKey(nq, nr)
      if (!occupied.has(key) && !visited.has(key)) {
        visited.add(key)
        queue.push([nq, nr])
        count++
        if (count >= limit) return count
      }
    }
  }
  return count
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

    if (chaos < 0.62) {
      // Compact fill — prefer cells with most territory neighbors (fills gaps)
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
      // 55%: grow from the "tips" — pick frontier cells adjacent to recent additions
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

  // If frontier was exhausted before reaching count, re-scan all territory
  // borders ignoring the visited set (they may have been marked visited early
  // when the territory was smaller and couldn't reach them)
  if (cells.length < count) {
    for (const cellKey of inTerritory) {
      const [cq, cr] = cellKey.split(",").map(Number)
      for (const [dq, dr] of HEX_DIRECTIONS) {
        const nq = cq + dq
        const nr = cr + dr
        const key = hexKey(nq, nr)
        if (!occupied.has(key) && !inTerritory.has(key) && !frontierMap.has(key)) {
          let nCount = 0
          for (const [ddq, ddr] of HEX_DIRECTIONS) {
            if (inTerritory.has(hexKey(nq + ddq, nr + ddr))) nCount++
          }
          frontierMap.set(key, { q: nq, r: nr, neighbors: nCount })
        }
      }
    }

    // Continue BFS growth with the newly discovered frontier
    while (cells.length < count && frontierMap.size > 0) {
      // Prefer filling gaps (most territory neighbors)
      let maxN = 0
      for (const entry of frontierMap.values()) {
        if (entry.neighbors > maxN) maxN = entry.neighbors
      }
      const candidates: string[] = []
      for (const [key, entry] of frontierMap) {
        if (entry.neighbors >= maxN) candidates.push(key)
      }
      const pickKey = candidates[Math.floor(rng() * candidates.length)]
      const picked = frontierMap.get(pickKey)!
      frontierMap.delete(pickKey)
      cells.push({ q: picked.q, r: picked.r })
      inTerritory.add(pickKey)

      for (const [dq, dr] of HEX_DIRECTIONS) {
        const nq = picked.q + dq
        const nr = picked.r + dr
        const key = hexKey(nq, nr)
        if (occupied.has(key) || inTerritory.has(key)) continue
        if (frontierMap.has(key)) {
          frontierMap.get(key)!.neighbors++
        } else {
          let nCount = 0
          for (const [ddq, ddr] of HEX_DIRECTIONS) {
            if (inTerritory.has(hexKey(nq + ddq, nr + ddr))) nCount++
          }
          frontierMap.set(key, { q: nq, r: nr, neighbors: nCount })
        }
      }
    }
  }

  return cells
}

/**
 * Max flat-plane radius of an island at cellSize=1, including hex corners + jitter.
 * Matches territory-mesh-builder constants.
 */
function computeIslandExtentUnit(cells: HexCell[]): number {
  const hexR = 1
  const jitter = 0.12
  let maxDist = hexR * (1 + jitter)

  for (const { q, r } of cells) {
    const [cx, cy] = hexToLocal(q, r, 1)
    maxDist = Math.max(maxDist, Math.hypot(cx, cy) + hexR * (1 + jitter))
  }

  return maxDist
}

function computeMaxIslandExtentUnit(territories: Territory[]): number {
  const cellsByIsland = new Map<string, HexCell[]>()

  for (const t of territories) {
    const existing = cellsByIsland.get(t.islandId) ?? []
    existing.push(...t.cells)
    cellsByIsland.set(t.islandId, existing)
  }

  let maxExtent = 1
  for (const cells of cellsByIsland.values()) {
    maxExtent = Math.max(maxExtent, computeIslandExtentUnit(cells))
  }

  return maxExtent
}

function islandAngularRadius(islandCount: number): number {
  return Math.sqrt((4 * Math.PI) / Math.max(islandCount, 1)) / 2
}

/**
 * Compute base cellSize + planetRadius.
 *
 * Uses the largest cell size that satisfies both:
 *  - target land coverage (~45 % of sphere)
 *  - largest island fits in its angular Fibonacci cell
 *
 * Prefers smaller hexes over a bloated planet. Planet radius only grows
 * when hexes would become unreadable (< READABLE_MIN).
 */
function computePlanetLayout(
  totalCells: number,
  islandCount: number,
  maxIslandExtentUnit: number,
): { cellSize: number; planetRadius: number } {
  const MAX_CELL_SIZE = 0.25
  const TARGET_COVERAGE = 0.45
  const READABLE_MIN = 0.024
  const SAFETY = 0.88
  const HEX_AREA = (3 * Math.sqrt(3)) / 2

  const angularRadius = islandAngularRadius(islandCount)

  const csFromCoverage = Math.sqrt(
    (4 * Math.PI * BASE_PLANET_RADIUS ** 2 * TARGET_COVERAGE) /
      (Math.max(totalCells, 1) * HEX_AREA),
  )

  const csFromExtent =
    (SAFETY * angularRadius * BASE_PLANET_RADIUS) / maxIslandExtentUnit

  let cellSize = Math.min(csFromCoverage, csFromExtent, MAX_CELL_SIZE)
  let planetRadius = BASE_PLANET_RADIUS

  if (cellSize < READABLE_MIN) {
    planetRadius = BASE_PLANET_RADIUS * (READABLE_MIN / cellSize)
    cellSize = READABLE_MIN
  }

  return { cellSize, planetRadius }
}

/**
 * Main entry: transforms API response into a PlanetSnapshot ready for rendering.
 */
export function buildPlanetSnapshot(
  apiResponse: PlanetApiResponse,
): PlanetSnapshot {
  // Pre-compute each island's developer list so we can sort by size.
  // Largest islands are placed first on the Fibonacci spiral: consecutive
  // Fibonacci points are separated by the golden angle (~137.5°), so the
  // biggest islands end up maximally spread across the sphere.
  const islandEntries = Object.entries(apiResponse.islands)
    .map(([id, devList]) => ({
      id,
      devs: devList.map(([login, cellCount]) => ({ login, cellCount })),
    }))
    .sort((a, b) => {
      const totalA = a.devs.reduce((s, d) => s + d.cellCount, 0)
      const totalB = b.devs.reduce((s, d) => s + d.cellCount, 0)
      return totalB - totalA
    })

  const anchors = fibonacciSphereAnchors(islandEntries.length)

  let allTerritories: Territory[] = []
  let grandTotalCells = 0

  const islands: Island[] = islandEntries.map(({ id, devs }, i) => {
    const { territories, totalCells } = growTerritories(devs, id)
    allTerritories = allTerritories.concat(territories)
    grandTotalCells += totalCells

    return {
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1).replace(/[-_]/g, " "),
      anchor: anchors[i] || [Math.PI / 2, (i * Math.PI * 2) / islandEntries.length],
      color: getIslandColor(id),
      cellCount: totalCells,
    }
  })

  const { cellSize, planetRadius } = computePlanetLayout(
    grandTotalCells,
    islandEntries.length,
    computeMaxIslandExtentUnit(allTerritories),
  )

  return {
    version: apiResponse.updated_at,
    cellSize,
    planetRadius,
    islands,
    territories: allTerritories,
  }
}
