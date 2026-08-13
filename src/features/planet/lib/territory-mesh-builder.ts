/**
 * Territory mesh builder: constructs a single merged BufferGeometry for all territories.
 *
 * Features:
 * - Continuous landmass per island that rises from the ocean via a coastline cliff
 *   (the "island emerging from water" look).
 * - Each hex cell reads as an individual tile via a beveled top (flat inner face +
 *   a darker beveled skirt down to a shared outer ring) — adjacent tiles touch, so
 *   there is no see-through gap, only a dark groove between them.
 * - Procedural per-cell color variation + strong per-developer hue/lightness spread.
 * - Border line segments (per territory) for hover/highlight outlines.
 * - Single draw call = fast rendering.
 */

import * as THREE from "three"

import type { Island, PlanetSnapshot } from "../types/snapshot"
import { HEX_DIRECTIONS, hexToLocal } from "./hex-grid"
import { islandTangentFrame, PLANET_RADIUS } from "./planet-projection"

// Terrain proportions relative to cellSize
const TERRAIN_HEIGHT_RATIO = 0.95
const BORDER_DELTA_RATIO = 0.025

// Minimum terrain height above the ocean sphere surface.
// Ocean wave amplitudes sum to at most 0.019 units — this floor adds a small
// safety margin so cells always emerge naturally from the water.
const MIN_TERRAIN_HEIGHT = 0.05

// Beveled tile look: the flat top face is inset toward the center, and the
// shared outer ring sits slightly lower so two neighbouring bevels meet in a
// dark V groove (no hole to the planet underneath).
const BEVEL_INSET = 0.78
const GROOVE_DROP_RATIO = 0.22

// Per-tile top height variation (relative to H) for a non-flat, lively relief.
// Stays above the (lower) shared outer ring, so neighbours never crack apart.
const TOP_HEIGHT_VARIATION = 0.16

// Coastline waterline: fraction of the cliff height (from the ocean up) that
// reads as "in the water". Below this is an aqua water band, above is rock.
const WATERLINE_RATIO = 0.5

// Shoreline palette (stylized "emerging from water" look).
const FOAM_COLOR = new THREE.Color("#cdeeff")
const WATER_TOP_COLOR = new THREE.Color("#3aa7d8")
const WATER_BOTTOM_COLOR = new THREE.Color("#1d6ea3")

/**
 * Deterministic pseudo-random based on coordinates.
 * Returns value in [-1, 1].
 */
function seededRandom(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 73.4) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

/**
 * Base color for a developer's territory. Each dev gets a clearly distinct hue
 * shift + lightness step from the island's palette so neighbouring devs read as
 * different zones.
 */
function territoryColor(
  island: Island,
  devIndex: number,
  totalInIsland: number,
): THREE.Color {
  const base = new THREE.Color(island.color)
  const hsl = { h: 0, s: 0, l: 0 }
  base.getHSL(hsl)

  // Well-spread hue shift per developer (golden-ratio stride avoids clustering).
  const hueShift = (((devIndex * 0.3819) % 1) - 0.5) * 0.26
  // Lightness gradient across developers + alternation so adjacent indices differ.
  const t = totalInIsland > 1 ? devIndex / (totalInIsland - 1) : 0.5
  const lightness = 0.4 + t * 0.26 + (devIndex % 2 === 0 ? 0.04 : -0.04)
  const saturation = 0.64 + (1 - t) * 0.24

  return new THREE.Color().setHSL(
    (hsl.h + hueShift + 1) % 1,
    clamp01(saturation),
    clamp01(lightness),
  )
}

function hslDistance(a: THREE.Color, b: THREE.Color): number {
  const ha = { h: 0, s: 0, l: 0 }
  const hb = { h: 0, s: 0, l: 0 }
  a.getHSL(ha)
  b.getHSL(hb)
  let dh = Math.abs(ha.h - hb.h)
  dh = Math.min(dh, 1 - dh)
  return dh * 2 + Math.abs(ha.s - hb.s) + Math.abs(ha.l - hb.l)
}

/** Greedy palette pick: maximize contrast with already-colored neighbours. */
function assignTerritoryColors(
  snapshot: PlanetSnapshot,
  occupancy: Map<string, number>,
): Map<number, THREE.Color> {
  const adjacency = new Map<number, Set<number>>()
  const link = (a: number, b: number) => {
    if (a === b) return
    if (!adjacency.has(a)) adjacency.set(a, new Set())
    if (!adjacency.has(b)) adjacency.set(b, new Set())
    adjacency.get(a)!.add(b)
    adjacency.get(b)!.add(a)
  }

  snapshot.territories.forEach((t, tIdx) => {
    t.cells.forEach((c) => {
      for (const [dq, dr] of HEX_DIRECTIONS) {
        const nT = occupancy.get(`${t.islandId}:${c.q + dq},${c.r + dr}`)
        if (nT !== undefined && nT !== tIdx) link(tIdx, nT)
      }
    })
  })

  const strHash = (s: string) =>
    [...s].reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0)

  const colorMap = new Map<number, THREE.Color>()
  for (const island of snapshot.islands) {
    const indices = snapshot.territories.flatMap((t, i) =>
      t.islandId === island.id ? [i] : [],
    )
    const palette = indices.map((_, i) => territoryColor(island, i, indices.length))
    // Sort by login hash, breaks the spatial pattern while
    const sorted = [...indices].sort(
      (a, b) =>
        strHash(snapshot.territories[a].githubLogin) -
        strHash(snapshot.territories[b].githubLogin),
    )

    for (const tIdx of sorted) {
      const neighbors = adjacency.get(tIdx)
      let bestSlot = 0
      let bestScore = -1
      for (let slot = 0; slot < palette.length; slot++) {
        let minDist = Infinity
        if (neighbors) {
          for (const nIdx of neighbors) {
            const assigned = colorMap.get(nIdx)
            if (assigned) minDist = Math.min(minDist, hslDistance(palette[slot], assigned))
          }
        }
        const score = minDist === Infinity ? 1 : minDist
        if (score > bestScore || (score === bestScore && slot < bestSlot)) {
          bestScore = score
          bestSlot = slot
        }
      }
      // Micro-jitter seeded by login: differentiates devs that land on the same
      // palette slot (non-adjacent territories can share a slot with 75+ devs).
      const lh = strHash(snapshot.territories[tIdx].githubLogin)
      const jHue = ((lh & 0xff) / 255 - 0.5) * 0.03
      const jLight = (((lh >> 8) & 0xff) / 255 - 0.5) * 0.04
      const hsl = { h: 0, s: 0, l: 0 }
      palette[bestSlot].getHSL(hsl)
      colorMap.set(
        tIdx,
        new THREE.Color().setHSL((hsl.h + jHue + 1) % 1, hsl.s, clamp01(hsl.l + jLight)),
      )
    }
  }

  return colorMap
}

/**
 * Per-cell color variation around the dev base color — breaks up the flat fill
 * so the terrain feels alive (procedural "texture").
 */
function varyCellColor(base: THREE.Color, q: number, r: number): THREE.Color {
  const hsl = { h: 0, s: 0, l: 0 }
  base.getHSL(hsl)
  const lv = seededRandom(q, r, 11) * 0.04
  const hv = seededRandom(q, r, 23) * 0.008
  const sv = seededRandom(q, r, 31) * 0.03
  return new THREE.Color().setHSL(
    (hsl.h + hv + 1) % 1,
    clamp01(hsl.s + sv),
    clamp01(hsl.l + lv),
  )
}

function scaledColor(c: THREE.Color, factor: number): THREE.Color {
  return new THREE.Color(c.r * factor, c.g * factor, c.b * factor)
}

// Scratch vectors for projection (single-threaded safe)
const _anchor = new THREE.Vector3()
const _scratch = new THREE.Vector3()
const _inner3D: THREE.Vector3[] = Array.from({ length: 6 }, () => new THREE.Vector3())
const _outer3D: THREE.Vector3[] = Array.from({ length: 6 }, () => new THREE.Vector3())
const _center3D = new THREE.Vector3()
const _n = new THREE.Vector3()
const _baseA = new THREE.Vector3()
const _baseB = new THREE.Vector3()
const _midA = new THREE.Vector3()
const _midB = new THREE.Vector3()
const _bA = new THREE.Vector3()
const _bB = new THREE.Vector3()

function project(
  px: number,
  py: number,
  right: THREE.Vector3,
  up: THREE.Vector3,
  anchor: THREE.Vector3,
  height: number,
  planetRadius: number,
  out: THREE.Vector3,
): void {
  out.copy(anchor)
  _scratch.copy(right).multiplyScalar(px)
  out.add(_scratch)
  _scratch.copy(up).multiplyScalar(py)
  out.add(_scratch)
  out.normalize().multiplyScalar(planetRadius + height)
}

// Edge vertex pairs for each hex direction (flat-top hex)
const EDGE_VERT_PAIRS = [
  [0, 1],
  [5, 0],
  [4, 5],
  [3, 4],
  [2, 3],
  [1, 2],
]

export type TerritoryMeshData = {
  geometry: THREE.BufferGeometry
  faceToTerritory: Int32Array
  territoryFaceRanges: ReadonlyArray<{ faceStart: number; faceCount: number }>
  borderGeometry: THREE.BufferGeometry
  territoryBorderRanges: ReadonlyArray<{ start: number; count: number }>
  allBorderPositions: Float32Array
  /** Dark contour drawn permanently between adjacent developers' territories. */
  seamGeometry: THREE.BufferGeometry
}

export function buildTerritoryMesh(snapshot: PlanetSnapshot): TerritoryMeshData {
  const cs = snapshot.cellSize
  const planetRadius = snapshot.planetRadius ?? PLANET_RADIUS
  const hexR = cs
  const innerR = cs * BEVEL_INSET
  const borderDelta = cs * BORDER_DELTA_RATIO

  // Uniform terrain height so the shared outer ring of neighbouring cells lines
  // up exactly → continuous landmass with no cracks.
  const H = Math.max(cs * TERRAIN_HEIGHT_RATIO, MIN_TERRAIN_HEIGHT)
  const outerH = H - H * GROOVE_DROP_RATIO
  const cliffBottomScale = planetRadius / (planetRadius + outerH)
  const borderScale = (planetRadius + H + borderDelta) / (planetRadius + outerH)

  const islandMap = new Map(snapshot.islands.map((i) => [i.id, i]))

  // Territory occupancy: "islandId:q,r" → territory index (for coloring + borders)
  const occupancy = new Map<string, number>()
  // Island occupancy: any cell of the island present (for the coastline cliff)
  const islandOccupancy = new Set<string>()
  snapshot.territories.forEach((t, tIdx) => {
    t.cells.forEach((c) => {
      occupancy.set(`${t.islandId}:${c.q},${c.r}`, tIdx)
      islandOccupancy.add(`${t.islandId}:${c.q},${c.r}`)
    })
  })

  const territoryColors = assignTerritoryColors(snapshot, occupancy)

  // Count totals for buffer allocation
  const totalCells = snapshot.territories.reduce((s, t) => s + t.cells.length, 0)
  let totalCoastEdges = 0
  let totalBorderEdges = 0
  let totalSeamEdges = 0
  snapshot.territories.forEach((t, tIdx) => {
    t.cells.forEach((c) => {
      HEX_DIRECTIONS.forEach(([dq, dr]) => {
        const key = `${t.islandId}:${c.q + dq},${c.r + dr}`
        const inIsland = islandOccupancy.has(key)
        if (!inIsland) totalCoastEdges++
        const nT = occupancy.get(key)
        if (nT === undefined || nT !== tIdx) totalBorderEdges++
        if (inIsland && nT !== tIdx) totalSeamEdges++
      })
    })
  })

  // Per cell: inner top fan (6 tris) + bevel skirt (6 edges × 2 tris).
  // Per coastline edge: a 2-band cliff (rock + water) = 4 tris.
  const totalTopVerts = totalCells * 18
  const totalSkirtVerts = totalCells * 36
  const totalCliffVerts = totalCoastEdges * 12
  const totalVerts = totalTopVerts + totalSkirtVerts + totalCliffVerts
  const totalFaces = totalCells * 18 + totalCoastEdges * 4

  const positions = new Float32Array(totalVerts * 3)
  const colors = new Float32Array(totalVerts * 3)
  const normals = new Float32Array(totalVerts * 3)
  const faceToTerritory = new Int32Array(totalFaces)
  const allBorderPositions = new Float32Array(totalBorderEdges * 6)
  const seamPositions = new Float32Array(totalSeamEdges * 6)

  // Cliff waterline scale: corner direction × this length sits at the waterline.
  const midScale = (planetRadius + outerH * WATERLINE_RATIO) / (planetRadius + outerH)

  const territoryFaceRanges: { faceStart: number; faceCount: number }[] = []
  const territoryBorderRanges: { start: number; count: number }[] = []

  let vIdx = 0
  let fIdx = 0
  let bIdx = 0
  let sIdx = 0

  // Writes one triangle (3 verts) with the per-cell radial normal `_n`.
  // Flat shading recomputes normals from positions, so `_n` is only a fallback.
  function pushTri(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, col: THREE.Color, tIdx: number) {
    pushTri3(a, b, c, col, col, col, tIdx)
  }

  // Triangle with a distinct color per vertex (used for gradient cliff bands).
  function pushTri3(
    a: THREE.Vector3,
    b: THREE.Vector3,
    c: THREE.Vector3,
    ca: THREE.Color,
    cb: THREE.Color,
    cc: THREE.Color,
    tIdx: number,
  ) {
    const verts = [a, b, c]
    const cols = [ca, cb, cc]
    for (let k = 0; k < 3; k++) {
      const v = verts[k]
      const col = cols[k]
      const vi = vIdx * 3
      positions[vi] = v.x
      positions[vi + 1] = v.y
      positions[vi + 2] = v.z
      normals[vi] = _n.x
      normals[vi + 1] = _n.y
      normals[vi + 2] = _n.z
      colors[vi] = col.r
      colors[vi + 1] = col.g
      colors[vi + 2] = col.b
      vIdx++
    }
    faceToTerritory[fIdx++] = tIdx
  }

  snapshot.territories.forEach((territory, tIdx) => {
    const island = islandMap.get(territory.islandId)
    if (!island) {
      territoryFaceRanges.push({ faceStart: fIdx, faceCount: 0 })
      territoryBorderRanges.push({ start: bIdx, count: 0 })
      return
    }

    const [phi, theta] = island.anchor
    _anchor.setFromSpherical(new THREE.Spherical(planetRadius, phi, theta))
    const { right, up } = islandTangentFrame(phi, theta)

    const devColor = territoryColors.get(tIdx)!

    const faceStart = fIdx
    const borderStart = bIdx

    territory.cells.forEach((cell) => {
      const [cx, cy] = hexToLocal(cell.q, cell.r, cs)

      // Per-tile top height (the shared outer ring stays at `outerH`, so tiles
      // can bob up/down for relief without opening cracks between neighbours).
      const topH = H * (1 + seededRandom(cell.q, cell.r, 7) * TOP_HEIGHT_VARIATION)

      // Outer ring at full radius (shared with neighbours) + inset top corners.
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        project(cx + hexR * cos, cy + hexR * sin, right, up, _anchor, outerH, planetRadius, _outer3D[i])
        project(cx + innerR * cos, cy + innerR * sin, right, up, _anchor, topH, planetRadius, _inner3D[i])
      }
      project(cx, cy, right, up, _anchor, topH, planetRadius, _center3D)

      // Radial normal at the cell center (fallback for the flat-shaded material).
      _n.copy(_center3D).normalize()

      // Per-cell colors
      const cellTop = varyCellColor(devColor, cell.q, cell.r)
      const cellGroove = scaledColor(cellTop, 0.5)
      const seamColor = scaledColor(cellTop, 0.28)
      const cliffTop = scaledColor(cellTop, 0.5)

      // Inner top face: 6-triangle fan (flat lit surface)
      for (let i = 0; i < 6; i++) {
        pushTri(_center3D, _inner3D[i], _inner3D[(i + 1) % 6], cellTop, tIdx)
      }

      // Bevel skirt + coastline cliff + border line, per edge
      HEX_DIRECTIONS.forEach(([dq, dr], dirIdx) => {
        const [ei, ej] = EDGE_VERT_PAIRS[dirIdx]
        const key = `${territory.islandId}:${cell.q + dq},${cell.r + dr}`
        const isCoast = !islandOccupancy.has(key)
        const nT = occupancy.get(key)
        const isInterDev = !isCoast && nT !== tIdx

        const ia = _inner3D[ei]
        const ib = _inner3D[ej]
        const oa = _outer3D[ei]
        const ob = _outer3D[ej]

        // Bevel skirt: inset top edge → shared (lower) outer ring.
        const skirtColor = isInterDev ? seamColor : cellGroove
        pushTri(ia, oa, ob, skirtColor, tIdx)
        pushTri(ia, ob, ib, skirtColor, tIdx)

        // Coastline cliff: 2 bands (rock above the waterline, water below) so
        // the island reads as emerging from the ocean.
        if (isCoast) {
          _midA.copy(oa).multiplyScalar(midScale)
          _midB.copy(ob).multiplyScalar(midScale)
          _baseA.copy(oa).multiplyScalar(cliffBottomScale)
          _baseB.copy(ob).multiplyScalar(cliffBottomScale)

          // Rock band: outer ring (cliffTop) → waterline (foam).
          pushTri3(oa, _midA, _midB, cliffTop, FOAM_COLOR, FOAM_COLOR, tIdx)
          pushTri3(oa, _midB, ob, cliffTop, FOAM_COLOR, cliffTop, tIdx)
          // Water band: waterline (water-top) → ocean (water-bottom).
          pushTri3(_midA, _baseA, _baseB, WATER_TOP_COLOR, WATER_BOTTOM_COLOR, WATER_BOTTOM_COLOR, tIdx)
          pushTri3(_midA, _baseB, _midB, WATER_TOP_COLOR, WATER_BOTTOM_COLOR, WATER_TOP_COLOR, tIdx)
        }

        // Border line — only on the territory's outline (neighbour differs).
        if (nT === undefined || nT !== tIdx) {
          _bA.copy(oa).multiplyScalar(borderScale)
          _bB.copy(ob).multiplyScalar(borderScale)
          const bi = bIdx * 6
          allBorderPositions[bi] = _bA.x
          allBorderPositions[bi + 1] = _bA.y
          allBorderPositions[bi + 2] = _bA.z
          allBorderPositions[bi + 3] = _bB.x
          allBorderPositions[bi + 4] = _bB.y
          allBorderPositions[bi + 5] = _bB.z
          bIdx++

          // Dark contour: inter-dev seams only (not the coastline).
          if (isInterDev) {
            const si = sIdx * 6
            seamPositions[si] = _bA.x
            seamPositions[si + 1] = _bA.y
            seamPositions[si + 2] = _bA.z
            seamPositions[si + 3] = _bB.x
            seamPositions[si + 4] = _bB.y
            seamPositions[si + 5] = _bB.z
            sIdx++
          }
        }
      })
    })

    territoryFaceRanges.push({ faceStart, faceCount: fIdx - faceStart })
    territoryBorderRanges.push({ start: borderStart, count: bIdx - borderStart })
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3))
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

  const borderGeometry = new THREE.BufferGeometry()
  borderGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(allBorderPositions, 3),
  )

  const seamGeometry = new THREE.BufferGeometry()
  seamGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(seamPositions, 3),
  )

  return {
    geometry,
    faceToTerritory,
    territoryFaceRanges,
    borderGeometry,
    territoryBorderRanges,
    allBorderPositions,
    seamGeometry,
  }
}
