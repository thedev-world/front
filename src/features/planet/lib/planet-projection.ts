import * as THREE from "three"

import type { HexCell, Island, Territory } from "../types/snapshot"
import { hexToLocal } from "./hex-grid"

export const BASE_PLANET_RADIUS = 5
/** Default radius when no snapshot is available. Prefer `snapshot.planetRadius`. */
export const PLANET_RADIUS = BASE_PLANET_RADIUS

const TERRAIN_HEIGHT_RATIO = 0.5
const MIN_TERRAIN_HEIGHT = 0.025

/** Matches territory mesh extrusion height in territory-mesh-builder. */
export function terrainSurfaceHeight(cellSize: number): number {
  return Math.max(cellSize * TERRAIN_HEIGHT_RATIO, MIN_TERRAIN_HEIGHT)
}

export type IslandLabelTransform = {
  position: THREE.Vector3
  rotation: THREE.Euler
}

export function computeIslandLabelTransform(
  island: Island,
  territories: Territory[],
  cellSize: number,
  planetRadius: number,
  surfaceOffset = 0.02,
): IslandLabelTransform {
  const islandCells = territories
    .filter((t) => t.islandId === island.id)
    .flatMap((t) => t.cells)

  const height = terrainSurfaceHeight(cellSize) + surfaceOffset
  const [anchorPhi, anchorTheta] = island.anchor

  const frameAt = (phi: number, theta: number, radius: number): IslandLabelTransform => {
    const position = sphericalToWorld(phi, theta, radius)
    const { normal, right, up } = islandTangentFrame(phi, theta)
    const rotation = new THREE.Euler().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(right, up, normal),
    )
    return { position, rotation }
  }

  if (islandCells.length === 0) {
    return frameAt(anchorPhi, anchorTheta, planetRadius + height)
  }

  const centroid = new THREE.Vector3()
  for (const cell of islandCells) {
    centroid.add(
      cellWorldPosition(cell, anchorPhi, anchorTheta, cellSize, 0, planetRadius),
    )
  }
  centroid.divideScalar(islandCells.length)

  const direction = centroid.normalize()
  const spherical = new THREE.Spherical().setFromVector3(direction)

  return frameAt(spherical.phi, spherical.theta, planetRadius + height)
}

export function sphericalToWorld(
  phi: number,
  theta: number,
  radius = PLANET_RADIUS,
): THREE.Vector3 {
  return new THREE.Vector3().setFromSpherical(
    new THREE.Spherical(radius, phi, theta),
  )
}

export function islandTangentFrame(
  phi: number,
  theta: number,
): { normal: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3 } {
  const normal = sphericalToWorld(phi, theta).normalize()
  const yAxis = new THREE.Vector3(0, 1, 0)

  const right =
    Math.abs(normal.dot(yAxis)) > 0.99
      ? new THREE.Vector3(1, 0, 0)
      : new THREE.Vector3().crossVectors(yAxis, normal).normalize()

  const up = new THREE.Vector3().crossVectors(normal, right).normalize()

  return { normal, right, up }
}

export function cellWorldPosition(
  cell: HexCell,
  anchorPhi: number,
  anchorTheta: number,
  cellSize: number,
  heightOffset = 0,
  planetRadius = PLANET_RADIUS,
): THREE.Vector3 {
  const [hx, hy] = hexToLocal(cell.q, cell.r, cellSize)
  const anchorPoint = sphericalToWorld(anchorPhi, anchorTheta, planetRadius)
  const { right, up } = islandTangentFrame(anchorPhi, anchorTheta)

  const worldPos = anchorPoint
    .clone()
    .addScaledVector(right, hx)
    .addScaledVector(up, hy)

  return worldPos.normalize().multiplyScalar(planetRadius + heightOffset)
}
