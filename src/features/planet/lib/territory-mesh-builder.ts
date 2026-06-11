/**
 * Territory mesh builder: constructs a single merged BufferGeometry for all territories.
 *
 * Features:
 * - Deterministic jitter on hex vertices for organic/hand-drawn aesthetic
 * - Cliff walls on territory edges for depth
 * - Vertex colors with per-island palette
 * - Border line segments for hover outlines
 * - Single draw call = fast rendering
 */

import * as THREE from "three"

import type { Island, PlanetSnapshot } from "../types/snapshot"
import { HEX_DIRECTIONS, hexToLocal } from "./hex-grid"
import { islandTangentFrame, PLANET_RADIUS } from "./planet-projection"

// Terrain proportions relative to cellSize
const TERRAIN_HEIGHT_RATIO = 0.5
const BORDER_DELTA_RATIO = 0.025

// Minimum terrain height above the ocean sphere surface.
// Ocean wave amplitudes sum to at most 0.019 units — this floor adds a small
// safety margin so cells always emerge naturally from the water.
const MIN_TERRAIN_HEIGHT = 0.025

// Jitter amount relative to cellSize (organic hand-drawn feel)
const JITTER_AMOUNT = 0.12

/**
 * Deterministic pseudo-random based on coordinates.
 * Returns value in [-1, 1].
 */
function seededRandom(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 73.4) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

/**
 * Compute a unique corner key for a hex vertex so shared edges get identical jitter.
 * In a flat-top hex grid, each vertex is shared by up to 3 cells.
 * We use the absolute 2D position (snapped to grid) as the seed.
 */
function cornerJitter(
  cx: number,
  cy: number,
  hexR: number,
  vertexIndex: number,
  jitterAmount: number,
): [number, number] {
  // Compute the absolute position of this vertex
  const angle = (Math.PI / 3) * vertexIndex
  const vx = cx + hexR * Math.cos(angle)
  const vy = cy + hexR * Math.sin(angle)
  // Quantize to avoid floating point drift (round to grid resolution)
  const qx = Math.round(vx * 10000) / 10000
  const qy = Math.round(vy * 10000) / 10000
  // Deterministic jitter seeded by absolute vertex position
  const jx = seededRandom(qx, qy, 1) * jitterAmount
  const jy = seededRandom(qx, qy, 2) * jitterAmount
  return [jx, jy]
}

function territoryColor(
  island: Island,
  devIndex: number,
  totalInIsland: number,
): THREE.Color {
  const base = new THREE.Color(island.color)
  const hsl = { h: 0, s: 0, l: 0 }
  base.getHSL(hsl)

  // Varied hue shift per developer for visual distinction
  const hueShift = ((devIndex * 47) % 60 - 30) / 360
  // Vary lightness across developers in the island
  const t = totalInIsland > 1 ? devIndex / (totalInIsland - 1) : 0.5
  const lightness = 0.35 + t * 0.25
  const saturation = 0.65 + (1 - t) * 0.2

  return new THREE.Color().setHSL(
    (hsl.h + hueShift + 1) % 1,
    saturation,
    lightness,
  )
}

function wallColor(topColor: THREE.Color): THREE.Color {
  const hsl = { h: 0, s: 0, l: 0 }
  topColor.getHSL(hsl)
  return new THREE.Color().setHSL(hsl.h, hsl.s * 0.8, hsl.l * 0.35)
}

// Scratch vectors for projection (single-threaded safe)
const _anchor = new THREE.Vector3()
const _scratch = new THREE.Vector3()
const _hex3D: THREE.Vector3[] = Array.from({ length: 6 }, () => new THREE.Vector3())
const _center3D = new THREE.Vector3()

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
}

export function buildTerritoryMesh(snapshot: PlanetSnapshot): TerritoryMeshData {
  const cs = snapshot.cellSize
  const planetRadius = snapshot.planetRadius ?? PLANET_RADIUS
  const hexR = cs
  const borderDelta = cs * BORDER_DELTA_RATIO
  const jitter = cs * JITTER_AMOUNT

  const islandMap = new Map(snapshot.islands.map((i) => [i.id, i]))

  // Count devs per island for color variation
  const devsPerIsland = new Map<string, number>()
  snapshot.territories.forEach((t) => {
    devsPerIsland.set(t.islandId, (devsPerIsland.get(t.islandId) || 0) + 1)
  })
  let islandCounters = new Map<string, number>()

  // Cell occupancy: "islandId:q,r" → territory index
  const occupancy = new Map<string, number>()
  snapshot.territories.forEach((t, tIdx) => {
    t.cells.forEach((c) => occupancy.set(`${t.islandId}:${c.q},${c.r}`, tIdx))
  })

  // Count totals for buffer allocation
  const totalCells = snapshot.territories.reduce((s, t) => s + t.cells.length, 0)
  let totalOuterEdges = 0
  snapshot.territories.forEach((t, tIdx) => {
    t.cells.forEach((c) => {
      HEX_DIRECTIONS.forEach(([dq, dr]) => {
        const nT = occupancy.get(`${t.islandId}:${c.q + dq},${c.r + dr}`)
        if (nT === undefined || nT !== tIdx) totalOuterEdges++
      })
    })
  })

  const totalTopVerts = totalCells * 18 // 6 triangles × 3 verts
  const totalWallVerts = totalOuterEdges * 6 // 2 triangles × 3 verts
  const totalVerts = totalTopVerts + totalWallVerts
  const totalTopFaces = totalCells * 6
  const totalWallFaces = totalOuterEdges * 2
  const totalFaces = totalTopFaces + totalWallFaces

  const positions = new Float32Array(totalVerts * 3)
  const colors = new Float32Array(totalVerts * 3)
  const normals = new Float32Array(totalVerts * 3)
  const faceToTerritory = new Int32Array(totalFaces)
  const allBorderPositions = new Float32Array(totalOuterEdges * 6)

  const territoryFaceRanges: { faceStart: number; faceCount: number }[] = []
  const territoryBorderRanges: { start: number; count: number }[] = []

  let vIdx = 0
  let fIdx = 0
  let bIdx = 0

  islandCounters = new Map<string, number>()

  snapshot.territories.forEach((territory, tIdx) => {
    const island = islandMap.get(territory.islandId)
    if (!island) {
      territoryFaceRanges.push({ faceStart: fIdx, faceCount: 0 })
      territoryBorderRanges.push({ start: bIdx, count: 0 })
      return
    }

    // Track dev index within island for color variation
    const currentIdx = islandCounters.get(territory.islandId) || 0
    islandCounters.set(territory.islandId, currentIdx + 1)

    const [phi, theta] = island.anchor
    _anchor.setFromSpherical(new THREE.Spherical(planetRadius, phi, theta))
    const { right, up } = islandTangentFrame(phi, theta)

    const totalInIsland = devsPerIsland.get(territory.islandId) || 1
    const topColor = territoryColor(island, currentIdx, totalInIsland)
    const cliffColor = wallColor(topColor)
    const cellHeight = Math.max(cs * TERRAIN_HEIGHT_RATIO, MIN_TERRAIN_HEIGHT)
    const bottomScale = planetRadius / (planetRadius + cellHeight)
    const borderElevation =
      (planetRadius + cellHeight + borderDelta) / (planetRadius + cellHeight)

    const faceStart = fIdx
    const borderStart = bIdx

    territory.cells.forEach((cell) => {
      const [cx, cy] = hexToLocal(cell.q, cell.r, cs)

      // Compute 6 jittered hex vertex positions (jitter based on absolute vertex position = no gaps)
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const [jx, jy] = cornerJitter(cx, cy, hexR, i, jitter)
        project(
          cx + hexR * Math.cos(angle) + jx,
          cy + hexR * Math.sin(angle) + jy,
          right,
          up,
          _anchor,
          cellHeight,
          planetRadius,
          _hex3D[i],
        )
      }
      project(cx, cy, right, up, _anchor, cellHeight, planetRadius, _center3D)

      // Face normal = radial direction at center
      const len = _center3D.length()
      const nx = _center3D.x / len
      const ny = _center3D.y / len
      const nz = _center3D.z / len

      // Top face: 6 triangle fan
      for (let i = 0; i < 6; i++) {
        const a = _center3D
        const b = _hex3D[i]
        const c = _hex3D[(i + 1) % 6]

        for (const v of [a, b, c]) {
          const vi = vIdx * 3
          positions[vi] = v.x
          positions[vi + 1] = v.y
          positions[vi + 2] = v.z
          normals[vi] = nx
          normals[vi + 1] = ny
          normals[vi + 2] = nz
          colors[vi] = topColor.r
          colors[vi + 1] = topColor.g
          colors[vi + 2] = topColor.b
          vIdx++
        }
        faceToTerritory[fIdx++] = tIdx
      }

      // Outer edges: cliff walls
      HEX_DIRECTIONS.forEach(([dq, dr], dirIdx) => {
        const nT = occupancy.get(
          `${territory.islandId}:${cell.q + dq},${cell.r + dr}`,
        )
        if (nT !== undefined && nT === tIdx) return

        const [ei, ej] = EDGE_VERT_PAIRS[dirIdx]
        const ta = _hex3D[ei]
        const tb = _hex3D[ej]

        const bax = ta.x * bottomScale
        const bay = ta.y * bottomScale
        const baz = ta.z * bottomScale
        const bbx = tb.x * bottomScale
        const bby = tb.y * bottomScale
        const bbz = tb.z * bottomScale

        // Wall quad as 2 triangles
        const wallVerts: [number, number, number][] = [
          [ta.x, ta.y, ta.z],
          [bax, bay, baz],
          [bbx, bby, bbz],
          [ta.x, ta.y, ta.z],
          [bbx, bby, bbz],
          [tb.x, tb.y, tb.z],
        ]
        for (const [wx, wy, wz] of wallVerts) {
          const vi = vIdx * 3
          positions[vi] = wx
          positions[vi + 1] = wy
          positions[vi + 2] = wz
          normals[vi] = 0
          normals[vi + 1] = 0
          normals[vi + 2] = 0
          colors[vi] = cliffColor.r
          colors[vi + 1] = cliffColor.g
          colors[vi + 2] = cliffColor.b
          vIdx++
        }
        faceToTerritory[fIdx++] = tIdx
        faceToTerritory[fIdx++] = tIdx

        // Border line segment
        const bi = bIdx * 6
        allBorderPositions[bi] = ta.x * borderElevation
        allBorderPositions[bi + 1] = ta.y * borderElevation
        allBorderPositions[bi + 2] = ta.z * borderElevation
        allBorderPositions[bi + 3] = tb.x * borderElevation
        allBorderPositions[bi + 4] = tb.y * borderElevation
        allBorderPositions[bi + 5] = tb.z * borderElevation
        bIdx++
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

  return {
    geometry,
    faceToTerritory,
    territoryFaceRanges,
    borderGeometry,
    territoryBorderRanges,
    allBorderPositions,
  }
}
