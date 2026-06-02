"use client"

import { OrbitControls } from "@react-three/drei"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"

import { useMe } from "@/features/auth/api/use-me"
import { usePlanetData } from "../api/use-planet-data"
import { buildSnapshotWithMe } from "../lib/planet-me"
import { sphericalToWorld } from "../lib/planet-projection"
import { usePlanetStore } from "../stores/planet-store"
import type { Island, PlanetSnapshot } from "../types/snapshot"

import { IslandLabels } from "./island-labels"
import { IslandTerritories } from "./island-territories"
import { OceanPlanet } from "./ocean-planet"
import { StarField } from "./star-field"

/** Camera distance when centering on the user's island. */
const CAM_DIST = 16
/** Lerp factor per frame — ~2s to reach target at 60fps. */
const LERP_FACTOR = 0.04

function PlanetGroup({ children }: { children: React.ReactNode }) {
  return <group>{children}</group>
}

export function PlanetScene() {
  const { data: rawSnapshot } = usePlanetData()
  const { data: me } = useMe()

  const {
    setPausedAt,
    setHighlightedLogin,
    setSkipReveal,
  } = usePlanetStore()

  // Always highlight the logged-in user's territory
  useEffect(() => {
    if (me?.github_login) setHighlightedLogin(me.github_login)
  }, [me?.github_login, setHighlightedLogin])

  // Inject the user into the snapshot if they are not yet in the planet JSON
  const enrichedSnapshot: PlanetSnapshot | undefined = useMemo(() => {
    if (!rawSnapshot || !me) return rawSnapshot
    return buildSnapshotWithMe(rawSnapshot, me)
  }, [rawSnapshot, me])

  // Camera smoothly animates toward the user's island once per mount
  const hasCenteredRef = useRef(false)
  const cameraTargetIslandRef = useRef<Island | null>(null)
  const needsFreezeRef = useRef(false)
  const controlsRef = useRef<OrbitControlsImpl>(null)

  // Cancel camera lerp + skip reveal when user starts interacting
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const onStart = () => {
      if (cameraTargetIslandRef.current) {
        cameraTargetIslandRef.current = null
        setSkipReveal(true)
      }
    }
    controls.addEventListener("start", onStart)
    return () => controls.removeEventListener("start", onStart)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!enrichedSnapshot || !me?.island || hasCenteredRef.current) return
    const island = enrichedSnapshot.islands.find((i) => i.id === me.island)
    if (!island) return
    cameraTargetIslandRef.current = island
    hasCenteredRef.current = true
    // Freeze planet rotation only when arriving from onboarding
    if (usePlanetStore.getState().fromOnboarding) needsFreezeRef.current = true
  }, [enrichedSnapshot, me?.island])

  useFrame(({ clock, camera: cam }) => {
    // Apply freeze on first frame after onboarding arrival
    if (needsFreezeRef.current) {
      needsFreezeRef.current = false
      setPausedAt(clock.getElapsedTime())
    }

    const island = cameraTargetIslandRef.current
    if (!island) return

    // Recompute target each frame so the camera tracks the rotating island
    const { pausedAt } = usePlanetStore.getState()
    const planetRot = (pausedAt ?? clock.getElapsedTime()) * 0.015
    const [phi, theta] = island.anchor
    const target = sphericalToWorld(phi, theta + planetRot, CAM_DIST)

    cam.position.lerp(target, LERP_FACTOR)
    cam.lookAt(0, 0, 0)

    // Stop animating once close enough
    if (cam.position.distanceTo(target) < 0.08) {
      cameraTargetIslandRef.current = null
    }
  })

  return (
    <>
      {/* Cinematic 3-point lighting */}
      <ambientLight intensity={0.8} color="#c8ddf5" />
      <directionalLight position={[8, 5, 4]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[-6, 2, -5]} intensity={0.6} color="#d0eeff" />
      <directionalLight position={[0, -6, 6]} intensity={0.4} color="#e8f4ff" />

      {/* Subtle rim light from behind for atmosphere edge glow */}
      <pointLight position={[0, 0, -15]} intensity={0.3} color="#38bdf8" />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={7}
        maxDistance={30}
        zoomSpeed={0.5}
        rotateSpeed={0.4}
        dampingFactor={0.08}
        enableDamping
        makeDefault
      />

      <StarField />

      <PlanetGroup>
        <OceanPlanet />
        {enrichedSnapshot && (
          <>
            <IslandTerritories key={enrichedSnapshot.version} snapshot={enrichedSnapshot} />
            <IslandLabels islands={enrichedSnapshot.islands} />
          </>
        )}
      </PlanetGroup>

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.7}
          intensity={0.4}
          radius={0.7}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}
