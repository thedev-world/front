"use client"

import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { usePlanetData } from "@/features/planet/api/use-planet-data"
import { cellWorldPosition, sphericalToWorld } from "@/features/planet/lib/planet-projection"
import { usePlanetStore } from "@/features/planet/stores/planet-store"
import { IslandTerritories } from "@/features/planet/components/island-territories"
import { OceanPlanet } from "@/features/planet/components/ocean-planet"
import { StarField } from "@/features/planet/components/star-field"

const CAM_DIST = 6.5
const CAM_FOV = 55
const CAM_TILT = 3.5

const WORLD_UP = new THREE.Vector3(0, 1, 0)

type Props = {
  targetLogin: string
}

export function CaptureScene({ targetLogin }: Props) {
  const { get: getThree } = useThree()
  const { data: snapshot } = usePlanetData("/api/v1/planet")
  const { setIntroPhase, setCameraSettled } = usePlanetStore()

  const keyLightRef = useRef<THREE.DirectionalLight>(null)
  const fillLightRef = useRef<THREE.DirectionalLight>(null)
  const rimLightRef = useRef<THREE.DirectionalLight>(null)
  const oceanMatRef = useRef<THREE.ShaderMaterial>(null)

  useEffect(() => {
    setIntroPhase("done")
  }, [setIntroPhase])

  // Only show the target user's territory, others are excluded from the mesh.
  const captureSnapshot = useMemo(() => {
    if (!snapshot) return null
    const loginLower = targetLogin.toLowerCase()
    const territory = snapshot.territories.find((t) => t.githubLogin.toLowerCase() === loginLower)
    if (!territory) return null
    return { ...snapshot, territories: [territory] }
  }, [snapshot, targetLogin])

  // Position camera once data is ready, no lerp, snap immediately.
  useEffect(() => {
    if (!captureSnapshot) return
    const territory = captureSnapshot.territories[0]
    const island = captureSnapshot.islands.find((i) => i.id === territory.islandId)
    if (!island) return

    const [anchorPhi, anchorTheta] = island.anchor
    const { planetRadius, cellSize } = captureSnapshot

    // Real centroid of the territory cells (not the island anchor point).
    let centroid: THREE.Vector3
    if (territory.cells.length > 0) {
      const sum = new THREE.Vector3()
      for (const cell of territory.cells) {
        sum.add(cellWorldPosition(cell, anchorPhi, anchorTheta, cellSize, 0, planetRadius))
      }
      centroid = sum.divideScalar(territory.cells.length).normalize().multiplyScalar(planetRadius)
    } else {
      centroid = sphericalToWorld(anchorPhi, anchorTheta, planetRadius)
    }

    const outward = centroid.clone().normalize()

    // Any direction perpendicular to outward to offset the camera off-axis
    const dot = WORLD_UP.dot(outward)
    const perp = Math.abs(dot) > 0.99
      ? new THREE.Vector3(0, 0, 1)
      : WORLD_UP.clone().sub(outward.clone().multiplyScalar(dot)).normalize()

    const cam = getThree().camera

    cam.position
      .copy(outward.clone().multiplyScalar(CAM_DIST))
      .addScaledVector(perp, CAM_TILT)

    // cam.up = outward normal -> planet center is always at the bottom of the frame,
    // regardless of which island the territory is on.
    cam.up.copy(outward)
    cam.lookAt(centroid)

    const perspCam = cam as THREE.PerspectiveCamera
    perspCam.fov = CAM_FOV
    perspCam.updateProjectionMatrix()

    const right = new THREE.Vector3().crossVectors(outward, perp).normalize()

    const keyPos = outward.clone().multiplyScalar(12).addScaledVector(perp, 6).addScaledVector(right, 4)
    const fillPos = outward.clone().multiplyScalar(4).addScaledVector(perp, -5).addScaledVector(right, -3)
    const rimPos = outward.clone().multiplyScalar(-14).addScaledVector(perp, 2)

    keyLightRef.current?.position.copy(keyPos)
    fillLightRef.current?.position.copy(fillPos)
    rimLightRef.current?.position.copy(rimPos)

    if (oceanMatRef.current) {
      oceanMatRef.current.uniforms.uKeyLight.value = keyPos.clone().normalize()
      oceanMatRef.current.uniforms.uFillLight.value = fillPos.clone().normalize()
    }

    setCameraSettled(true)
  }, [captureSnapshot, getThree, setCameraSettled])

  return (
    <>
      <ambientLight intensity={0.45} color="#c8ddf5" />
      <directionalLight ref={keyLightRef} intensity={1.7} color="#ffffff" />
      <directionalLight ref={fillLightRef} intensity={0.4} color="#d0eeff" />
      <directionalLight ref={rimLightRef} intensity={0.3} color="#38bdf8" />

      <StarField />

      <OceanPlanet planetRadius={captureSnapshot?.planetRadius} matRef={oceanMatRef} />

      {captureSnapshot && (
        <IslandTerritories key={captureSnapshot.version} snapshot={captureSnapshot} />
      )}

      <EffectComposer>
        <Bloom luminanceThreshold={0.75} intensity={0.55} radius={0.85} mipmapBlur />
      </EffectComposer>
    </>
  )
}
