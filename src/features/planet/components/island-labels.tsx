"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { computeIslandLabelTransform, PLANET_RADIUS } from "../lib/planet-projection"
import { useEnrichedPlanetData } from "../api/use-enriched-planet-data"
import { usePlanetStore } from "../stores/planet-store"
import type { Island } from "../types/snapshot"

const CANVAS_W = 512
const CANVAS_H = 96
const BASE_OPACITY = 0.90

function drawMapLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  fill: string,
  haloWidth: number,
) {
  ctx.font = font
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.lineJoin = "round"
  ctx.strokeStyle = "rgba(0, 0, 0, 0.90)"
  ctx.lineWidth = haloWidth
  ctx.strokeText(text, x, y)
  ctx.fillStyle = fill
  ctx.fillText(text, x, y)
}

function makeTextTexture(name: string, cells: number, devs: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H

  const ctx = canvas.getContext("2d")!

  drawMapLabel(
    ctx,
    name,
    CANVAS_W / 2,
    CANVAS_H * 0.38,
    "bold 28px system-ui, -apple-system, sans-serif",
    "#ffffff",
    12,
  )

  drawMapLabel(
    ctx,
    `${cells} CELLS / ${devs} DEVS`,
    CANVAS_W / 2,
    CANVAS_H * 0.72,
    "18px system-ui, -apple-system, sans-serif",
    "rgba(255, 255, 255, 0.95)",
    9,
  )

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

type LabelMeshProps = {
  island: Island
  position: THREE.Vector3
  rotation: THREE.Euler
  texture: THREE.CanvasTexture
}

function IslandLabel({ island, position, rotation, texture }: LabelMeshProps) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  const { data: snapshot } = useEnrichedPlanetData()
  const hoveredTerritoryIndex = usePlanetStore((s) => s.hoveredTerritoryIndex)
  const hoveredIslandId = hoveredTerritoryIndex !== null
    ? snapshot?.territories[hoveredTerritoryIndex]?.islandId
    : null

  const isHovered = hoveredIslandId === island.id

  // Smoothly pulse opacity when hovered/unhovered
  useFrame(() => {
    if (!matRef.current) return
    const target = isHovered ? 0 : BASE_OPACITY
    matRef.current.opacity += (target - matRef.current.opacity) * 0.4
  })

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[2.2, 0.6]} />
      <meshBasicMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={BASE_OPACITY}
        depthTest
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}

type Props = {
  islands: Island[]
  planetRadius?: number
}

export function IslandLabels({ islands, planetRadius = PLANET_RADIUS }: Props) {
  const { data: snapshot } = useEnrichedPlanetData()

  const labels = useMemo(() => {
    if (!snapshot) return []

    const devCountByIsland = new Map<string, number>()
    for (const t of snapshot.territories) {
      devCountByIsland.set(t.islandId, (devCountByIsland.get(t.islandId) ?? 0) + 1)
    }

    return islands.map((island) => {
      const { position, rotation } = computeIslandLabelTransform(
        island,
        snapshot.territories,
        snapshot.cellSize,
        planetRadius,
      )
      const devs = devCountByIsland.get(island.id) ?? 0
      const texture = makeTextTexture(`${island.name.toUpperCase()} ISLAND`, island.cellCount, devs)
      return { island, position, rotation, texture }
    })
  }, [islands, snapshot, planetRadius])

  return (
    <>
      {labels.map((label) => (
        <IslandLabel key={label.island.id} {...label} />
      ))}
    </>
  )
}
