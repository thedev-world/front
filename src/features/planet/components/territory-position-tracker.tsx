"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo } from "react"
import * as THREE from "three"

import { cellWorldPosition, PLANET_RADIUS } from "../lib/planet-projection"
import { usePlanetStore } from "../stores/planet-store"
import type { Island, Territory } from "../types/snapshot"

type Props = {
  island: Island | undefined
  territory: Territory | undefined
  cellSize: number
  planetRadius?: number
}

export function TerritoryPositionTracker({
  island,
  territory,
  cellSize,
  planetRadius = PLANET_RADIUS,
}: Props) {
  const setMyTerritoryScreenPos = usePlanetStore((s) => s.setMyTerritoryScreenPos)
  const showOnboardingStats = usePlanetStore((s) => s.showOnboardingStats)

  const pos3d = useMemo(() => {
    if (!island || !territory || territory.cells.length === 0) return null

    const center = new THREE.Vector3(0, 0, 0)
    territory.cells.forEach((cell) => {
      center.add(
        cellWorldPosition(
          cell,
          island.anchor[0],
          island.anchor[1],
          cellSize,
          0,
          planetRadius,
        ),
      )
    })

    return center.divideScalar(territory.cells.length).normalize().multiplyScalar(planetRadius)
  }, [island, territory, cellSize, planetRadius])

  useFrame(({ camera }) => {
    if (!pos3d || !showOnboardingStats) {
      setMyTerritoryScreenPos(null)
      return
    }

    const vector = pos3d.clone()

    const toCamera = camera.position.clone().normalize()
    const normal = vector.clone().normalize()

    // 0.2 threshold to hide it slightly before it reaches the exact edge
    if (normal.dot(toCamera) < 0.2) {
      setMyTerritoryScreenPos(null)
      return
    }

    vector.project(camera)

    const x = ((vector.x + 1) / 2) * window.innerWidth
    const y = (-(vector.y - 1) / 2) * window.innerHeight

    setMyTerritoryScreenPos({ x, y })
  })

  return null
}
