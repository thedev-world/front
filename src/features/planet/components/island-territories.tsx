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
  const {
    setHoveredTerritory,
    setMousePos,
    hoveredTerritoryIndex,
    highlightedLogin,
    fromOnboarding,
    setFromOnboarding,
    setPausedAt,
    setSkipReveal,
    setShowOnboardingStats,
    focusLogin,
    setFocusLogin,
  } = usePlanetStore()

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
    const slice = posArr.slice(faceStart * 9, faceStart * 9 + faceCount * 9)
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


  // Permanent "me" highlight (golden)
  const myTerritoryIndex = useMemo(() => {
    if (!highlightedLogin) return null
    const idx = snapshot.territories.findIndex((t) => t.login === highlightedLogin)
    return idx === -1 ? null : idx
  }, [highlightedLogin, snapshot])

  // Solo island: one dev owns the whole island, label sits at the anchor — skip fill glow
  const isSoloIslandHighlight = useMemo(() => {
    if (myTerritoryIndex === null) return false
    const islandId = snapshot.territories[myTerritoryIndex].islandId
    return snapshot.territories.filter((t) => t.islandId === islandId).length === 1
  }, [myTerritoryIndex, snapshot])

  const myHighlightMeshRef = useRef<THREE.Mesh>(null)
  const myBorderRef = useRef<THREE.LineSegments>(null)
  const myPulseRef = useRef(0)

  // First authenticated visit: show stats once (no onboarding animation path)
  useEffect(() => {
    if (myTerritoryIndex === null || fromOnboarding) return
    const delay = setTimeout(() => {
      setShowOnboardingStats(true)
    }, 1800)
    return () => clearTimeout(delay)
  }, [myTerritoryIndex, fromOnboarding, setShowOnboardingStats])

  useEffect(() => {
    const mesh = myHighlightMeshRef.current
    if (!mesh) return
    const prev = mesh.geometry
    if (myTerritoryIndex === null) {
      mesh.geometry = new THREE.BufferGeometry()
      prev.dispose()
      return
    }
    const range = meshData.territoryFaceRanges[myTerritoryIndex]
    if (!range || range.faceCount === 0) return
    const { faceStart, faceCount } = range
    const posArr = meshData.geometry.attributes.position.array as Float32Array
    const slice = posArr.slice(faceStart * 9, faceStart * 9 + faceCount * 9)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(slice), 3))
    geo.computeVertexNormals()
    mesh.geometry = geo
    prev.dispose()
  }, [myTerritoryIndex, meshData])

  useEffect(() => {
    const lines = myBorderRef.current
    if (!lines) return
    const prev = lines.geometry
    if (myTerritoryIndex === null) {
      lines.geometry = new THREE.BufferGeometry()
      prev.dispose()
      return
    }
    const range = meshData.territoryBorderRanges[myTerritoryIndex]
    if (!range || range.count === 0) return
    const { start, count } = range
    const slice = meshData.allBorderPositions.slice(start * 6, (start + count) * 6)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(slice), 3))
    lines.geometry = geo
    prev.dispose()
  }, [myTerritoryIndex, meshData])

  useFrame(({ clock }) => {
    const highlight = myHighlightMeshRef.current
    const border = myBorderRef.current
    if (!highlight || !border) return
    const mat = highlight.material as THREE.MeshBasicMaterial
    const lineMat = border.material as THREE.LineBasicMaterial
    // Block golden highlight during reveal + flash: let it fade in only after the full sequence
    const { fromOnboarding: isRevealing } = usePlanetStore.getState()
    const isVisible = myTerritoryIndex !== null && !isRevealing && !flashPhaseRef.current
    const target = isVisible ? 1 : 0
    // Faster lerp on initial reveal-done fade-in for a snappy golden "settle"
    const factor = myPulseRef.current < 0.5 && isVisible ? 0.08 : 0.045
    myPulseRef.current += (target - myPulseRef.current) * factor
    const t = clock.getElapsedTime()
    const pulse = isVisible ? Math.sin(t * 1.5) * 0.04 : 0
    if (isSoloIslandHighlight) {
      mat.opacity = 0
      lineMat.opacity = myPulseRef.current * (0.9 + pulse * 1.5)
    } else {
      mat.opacity = myPulseRef.current * (0.22 + pulse)
      lineMat.opacity = myPulseRef.current * (0.6 + pulse * 1.2)
    }
  })

  // Leaderboard "focus" highlight
  const focusedTerritoryIndex = useMemo(() => {
    if (!focusLogin) return null
    const idx = snapshot.territories.findIndex((t) => t.login === focusLogin)
    return idx === -1 ? null : idx
  }, [focusLogin, snapshot])

  const focusHighlightMeshRef = useRef<THREE.Mesh>(null)
  const focusBorderRef = useRef<THREE.LineSegments>(null)
  const focusPulseRef = useRef(0)

  useEffect(() => {
    const mesh = focusHighlightMeshRef.current
    if (!mesh) return
    const prev = mesh.geometry
    if (focusedTerritoryIndex === null) {
      mesh.geometry = new THREE.BufferGeometry()
      prev.dispose()
      return
    }
    const range = meshData.territoryFaceRanges[focusedTerritoryIndex]
    if (!range || range.faceCount === 0) return
    const { faceStart, faceCount } = range
    const posArr = meshData.geometry.attributes.position.array as Float32Array
    const slice = posArr.slice(faceStart * 9, faceStart * 9 + faceCount * 9)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(slice), 3))
    geo.computeVertexNormals()
    mesh.geometry = geo
    prev.dispose()
  }, [focusedTerritoryIndex, meshData])

  useEffect(() => {
    const lines = focusBorderRef.current
    if (!lines) return
    const prev = lines.geometry
    if (focusedTerritoryIndex === null) {
      lines.geometry = new THREE.BufferGeometry()
      prev.dispose()
      return
    }
    const range = meshData.territoryBorderRanges[focusedTerritoryIndex]
    if (!range || range.count === 0) return
    const { start, count } = range
    const slice = meshData.allBorderPositions.slice(start * 6, (start + count) * 6)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(slice), 3))
    lines.geometry = geo
    prev.dispose()
  }, [focusedTerritoryIndex, meshData])

  useFrame(({ clock }) => {
    const highlight = focusHighlightMeshRef.current
    const border = focusBorderRef.current
    if (!highlight || !border) return
    const mat = highlight.material as THREE.MeshBasicMaterial
    const lineMat = border.material as THREE.LineBasicMaterial
    const isVisible = focusedTerritoryIndex !== null
    const target = isVisible ? 1 : 0
    focusPulseRef.current += (target - focusPulseRef.current) * 0.12
    const t = clock.getElapsedTime()
    const pulse = isVisible ? Math.sin(t * 3.0) * 0.08 : 0
    mat.opacity = focusPulseRef.current * (0.28 + pulse)
    lineMat.opacity = focusPulseRef.current * (0.75 + pulse * 1.5)
  })

  // Territory reveal animation (onboarding arrival)
  const revealMeshRef = useRef<THREE.Mesh>(null)
  const revealGeoRef = useRef<THREE.BufferGeometry | null>(null)
  const posBackupRef = useRef<Float32Array | null>(null)
  const revealedFacesRef = useRef(0)
  const revealDoneRef = useRef(false)
  // Flash phase: bright burst at end of reveal before golden highlight fades in
  const flashPhaseRef = useRef(false)
  const flashStartRef = useRef(0)

  // When the sequence starts: hide the territory in the main mesh + init glow geo
  useEffect(() => {
    if (!fromOnboarding || myTerritoryIndex === null) return

    const range = meshData.territoryFaceRanges[myTerritoryIndex]
    if (!range || range.faceCount === 0) return

    const posAttr = meshData.geometry.attributes.position as THREE.BufferAttribute
    const posArr = posAttr.array as Float32Array
    const vStart = range.faceStart * 9
    const vCount = range.faceCount * 9

    // 1. Backup the original vertex positions for this territory
    const backup = posArr.slice(vStart, vStart + vCount)
    posBackupRef.current = backup

    // 2. Zero out positions → degenerate triangles are invisible to the GPU
    posArr.fill(0, vStart, vStart + vCount)
    posAttr.needsUpdate = true

    // 3. Build glow geo from real positions, hidden initially via drawRange
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(backup), 3))
    geo.computeVertexNormals()
    geo.setDrawRange(0, 0)

    revealGeoRef.current?.dispose()
    revealGeoRef.current = geo
    revealedFacesRef.current = 0
    revealDoneRef.current = false

    const mesh = revealMeshRef.current
    if (mesh) mesh.geometry = geo
  }, [fromOnboarding, myTerritoryIndex, meshData])

  // Restore positions if the component unmounts mid-reveal
  useEffect(
    () => () => {
      revealGeoRef.current?.dispose()
      const backup = posBackupRef.current
      if (backup && myTerritoryIndex !== null) {
        const range = meshData.territoryFaceRanges[myTerritoryIndex]
        if (range) {
          const posAttr = meshData.geometry.attributes.position as THREE.BufferAttribute
          ;(posAttr.array as Float32Array).set(backup, range.faceStart * 9)
          posAttr.needsUpdate = true
        }
      }
    },
    [meshData, myTerritoryIndex],
  )

  useFrame(({ clock }) => {
    const mesh = revealMeshRef.current
    const geo = revealGeoRef.current
    const mat = mesh?.material as THREE.MeshBasicMaterial | undefined

    if (!mesh || !mat) return

    // Skip: user interacted -> restore everything immediately
    const { skipReveal } = usePlanetStore.getState()
    if (skipReveal && (fromOnboarding || flashPhaseRef.current) && !revealDoneRef.current) {
      const backup = posBackupRef.current
      if (backup && myTerritoryIndex !== null) {
        const range = meshData.territoryFaceRanges[myTerritoryIndex]
        if (range) {
          const posAttr = meshData.geometry.attributes.position as THREE.BufferAttribute
          ;(posAttr.array as Float32Array).set(backup, range.faceStart * 9)
          posAttr.needsUpdate = true
        }
      }
      mat.opacity = 0
      flashPhaseRef.current = false
      revealDoneRef.current = true
      posBackupRef.current = null
      setFromOnboarding(false)
      setPausedAt(null)
      setSkipReveal(false)
      return
    }

    // Phase 2: flash burst after all cells are revealed
    if (flashPhaseRef.current) {
      const FLASH_DURATION = 0.5
      const elapsed = clock.getElapsedTime() - flashStartRef.current
      const t = elapsed / FLASH_DURATION
      if (t >= 1) {
        // Flash done -> unblock golden highlight + show stats overlay
        mat.opacity = 0
        flashPhaseRef.current = false
        posBackupRef.current = null
        setFromOnboarding(false)
        setPausedAt(null)
        setShowOnboardingStats(true)
      } else {
        // Shape: fast rise (0→0.2 in 20% of time) then slow fade (0.2→1.0 in 80%)
        mat.opacity = t < 0.2 ? (t / 0.2) : (1 - (t - 0.2) / 0.8)
      }
      return
    }

    if (!fromOnboarding || myTerritoryIndex === null || revealDoneRef.current) {
      mat.opacity = 0
      return
    }

    const backup = posBackupRef.current
    if (!geo || !backup) return

    const range = meshData.territoryFaceRanges[myTerritoryIndex]
    if (!range) return

    // ~3 seconds at 60 fps
    const speed = Math.max(1, Math.ceil(range.faceCount / 180))
    revealedFacesRef.current = Math.min(revealedFacesRef.current + speed, range.faceCount)
    const revealed = revealedFacesRef.current

    // Restore revealed face positions in the main mesh (BFS order = centre outward)
    const posAttr = meshData.geometry.attributes.position as THREE.BufferAttribute
    ;(posAttr.array as Float32Array).set(backup.subarray(0, revealed * 9), range.faceStart * 9)
    posAttr.needsUpdate = true

    // Glow follows the same progression
    geo.setDrawRange(0, revealed * 3)
    mat.opacity = 0.45

    if (revealed >= range.faceCount) {
      revealDoneRef.current = true
      // Trigger flash phase
      flashPhaseRef.current = true
      flashStartRef.current = clock.getElapsedTime()
    }
  })

  // ─── Pointer events ───────────────────────────────────────────────────────
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
      // Clear leaderboard focus when user interacts directly with the planet
      if (usePlanetStore.getState().focusLogin) setFocusLogin(null)
      setHoveredTerritory(meshData.faceToTerritory[e.faceIndex])
    },
    [meshData.faceToTerritory, setFocusLogin, setHoveredTerritory, setMousePos],
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

      {/* Hover highlight (cyan) */}
      <mesh ref={highlightMeshRef} frustumCulled={false}>
        <bufferGeometry />
        <meshBasicMaterial
          color="#88ddff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthTest={true}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hover border */}
      <lineSegments ref={hoveredBorderRef} frustumCulled={false}>
        <bufferGeometry />
        <lineBasicMaterial color="#ffffff" transparent opacity={0} depthTest={true} depthWrite={false} />
      </lineSegments>

      {/* Permanent "me" highlight (golden) */}
      <mesh ref={myHighlightMeshRef} frustumCulled={false}>
        <bufferGeometry />
        <meshBasicMaterial
          color="#ffd700"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthTest={true}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Permanent "me" border (golden) */}
      <lineSegments ref={myBorderRef} frustumCulled={false}>
        <bufferGeometry />
        <lineBasicMaterial color="#ffd700" transparent opacity={0} depthTest={true} depthWrite={false} />
      </lineSegments>

      {/* Reveal animation (white additive, onboarding only) */}
      <mesh ref={revealMeshRef} frustumCulled={false}>
        <bufferGeometry />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Leaderboard focus highlight */}
      <mesh ref={focusHighlightMeshRef} frustumCulled={false}>
        <bufferGeometry />
        <meshBasicMaterial
          color="#88ddff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthTest={true}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Leaderboard focus border */}
      <lineSegments ref={focusBorderRef} frustumCulled={false}>
        <bufferGeometry />
        <lineBasicMaterial color="#ffffff" transparent opacity={0} depthTest={true} depthWrite={false} />
      </lineSegments>
    </group>
  )
}
