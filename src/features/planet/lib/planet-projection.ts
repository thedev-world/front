import * as THREE from "three"

import type { HexCell } from "../types/snapshot"
import { hexToLocal } from "./hex-grid"

export const BASE_PLANET_RADIUS = 5
/** Default radius when no snapshot is available. Prefer `snapshot.planetRadius`. */
export const PLANET_RADIUS = BASE_PLANET_RADIUS

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
