"use client"

import type { ThreeEvent } from "@react-three/fiber"
import { useFrame } from "@react-three/fiber"
import { useCallback, useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { buildTerritoryMesh } from "../lib/territory-mesh-builder"
import { usePlanetStore } from "../stores/planet-store"
import type { PlanetSnapshot } from "../types/snapshot"

type Props = {
  snapshot: PlanetSnapshot
}

export function IslandTerritories({ snapshot }: Props) {
  const { setHoveredTerritory, setMousePos, hoveredTerritoryIndex } =
    usePlanetStore()

  const meshData = useMemo(() => buildTerritoryMesh(snapshot), [snapshot])

  useEffect(
    () => () => {
      meshData.geometry.dispose()
      meshData.borderGeometry.dispose()
    },
    [meshData],
  )

  const highlightMeshRef = useRef<THREE.Mesh>(null)
  const hoveredBorderRef = useRef<THREE.LineSegments>(null)
  // Track current hover opacity for smooth animation
  const pulseRef = useRef(0)

  // Hover highlight geometry
  useEffect(() => {
    const mesh = highlightMeshRef.current
    if (!mesh) return

    const prev = mesh.geometry
    if (hoveredTerritoryIndex === null) {
      mesh.geometry = new THREE.BufferGeometry()
      prev.dispose()
      return
    }

    const range = meshData.territoryFaceRanges[hoveredTerritoryIndex]
    if (!range || range.faceCount === 0) return

    const { faceStart, faceCount } = range
    const posArr = meshData.geometry.attributes.position.array as Float32Array
    const start = faceStart * 9
    const slice = posArr.slice(start, start + faceCount * 9)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(slice), 3))
    geo.computeVertexNormals()

    mesh.geometry = geo
    prev.dispose()
  }, [hoveredTerritoryIndex, meshData])

  // Hover border geometry
  useEffect(() => {
    const lines = hoveredBorderRef.current
    if (!lines) return

    const prev = lines.geometry
    if (hoveredTerritoryIndex === null) {
      lines.geometry = new THREE.BufferGeometry()
      prev.dispose()
      return
    }

    const range = meshData.territoryBorderRanges[hoveredTerritoryIndex]
    if (!range || range.count === 0) return

    const { start, count } = range
    const slice = meshData.allBorderPositions.slice(start * 6, (start + count) * 6)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(slice), 3))

    lines.geometry = geo
    prev.dispose()
  }, [hoveredTerritoryIndex, meshData])

  // Animate hover pulse
  useFrame(({ clock }) => {
    const highlight = highlightMeshRef.current
    const border = hoveredBorderRef.current
    if (!highlight || !border) return

    const mat = highlight.material as THREE.MeshBasicMaterial
    const lineMat = border.material as THREE.LineBasicMaterial
    const isHovered = hoveredTerritoryIndex !== null

    // Smooth fade in/out
    const target = isHovered ? 1 : 0
    pulseRef.current += (target - pulseRef.current) * 0.12

    // Pulsing glow: sine wave on top of base opacity
    const t = clock.getElapsedTime()
    const pulse = isHovered ? Math.sin(t * 3.0) * 0.08 : 0

    mat.opacity = pulseRef.current * (0.28 + pulse)
    lineMat.opacity = pulseRef.current * (0.75 + pulse * 1.5)
  })

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (e.faceIndex == null) return

      const sphereNormal = e.point.clone().normalize()
      const toCamera = e.camera.position.clone().sub(e.point)
      if (sphereNormal.dot(toCamera) <= 0) {
        setHoveredTerritory(null)
        return
      }

      setMousePos({ x: e.clientX, y: e.clientY })
      setHoveredTerritory(meshData.faceToTerritory[e.faceIndex])
    },
    [meshData.faceToTerritory, setHoveredTerritory, setMousePos],
  )

  const handlePointerOut = useCallback(() => {
    setHoveredTerritory(null)
  }, [setHoveredTerritory])

  return (
    <group>
      {/* Main territory mesh */}
      <mesh
        geometry={meshData.geometry}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        frustumCulled={false}
      >
        <meshStandardMaterial
          vertexColors
          flatShading
          roughness={0.4}
          metalness={0.05}
          emissive="#ffffff"
          emissiveIntensity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hover highlight */}
      <mesh ref={highlightMeshRef} frustumCulled={false}>
        <bufferGeometry />
        <meshBasicMaterial
          color="#88ddff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hover border */}
      <lineSegments ref={hoveredBorderRef} frustumCulled={false}>
        <bufferGeometry />
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          depthTest={false}
        />
      </lineSegments>
    </group>
  )
}
