"use client"

import { OrbitControls } from "@react-three/drei"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"

import { useMe } from "@/features/auth/api/use-me"
import { usePlanetData } from "../api/use-planet-data"
import { buildSnapshotWithMe } from "../lib/planet-me"
import { sphericalToWorld } from "../lib/planet-projection"
import { usePlanetStore } from "../stores/planet-store"
import type { Island, PlanetSnapshot } from "../types/snapshot"

import { IntroTextSweep } from "./intro-text-sweep"
import { IslandLabels } from "./island-labels"
import { IslandTerritories } from "./island-territories"
import { OceanPlanet } from "./ocean-planet"
import { StarField } from "./star-field"

/** Camera distance when centering on the user's island. */
const CAM_DIST = 16
/** Lerp factor per frame — ~2s to reach target at 60fps. */
const LERP_FACTOR = 0.04

// Intro animation constants — single continuous camera motion
const INTRO_DURATION = 8.0
const INTRO_START_RADIUS = 50
const INTRO_END_RADIUS = 16
const INTRO_START_PHI = Math.PI / 2.5

export function PlanetScene() {
  const { data: rawSnapshot } = usePlanetData()
  const { data: me, isLoading: meLoading } = useMe()

  const {
    setPausedAt,
    setHighlightedLogin,
    setSkipReveal,
    setIntroPhase,
  } = usePlanetStore()

  // Reactive selectors for leaderboard focus
  const focusIslandId = usePlanetStore((s) => s.focusIslandId)
  const focusLogin = usePlanetStore((s) => s.focusLogin)

  // Always highlight the logged-in user's territory
  useEffect(() => {
    if (me?.github_login) setHighlightedLogin(me.github_login)
  }, [me?.github_login, setHighlightedLogin])

  // Inject the user into the snapshot if they are not yet in the planet JSON
  const enrichedSnapshot: PlanetSnapshot | undefined = useMemo(() => {
    if (!rawSnapshot || !me) return rawSnapshot
    return buildSnapshotWithMe(rawSnapshot, me)
  }, [rawSnapshot, me])

  // Camera focus triggered by leaderboard island accordion
  useEffect(() => {
    if (!focusIslandId || !enrichedSnapshot) return
    const island = enrichedSnapshot.islands.find((i) => i.id === focusIslandId)
    if (island) cameraTargetIslandRef.current = { island, keepDistance: true, fixedRadius: null }
  }, [focusIslandId, enrichedSnapshot])

  // Camera focus triggered by leaderboard row click (navigate to user's island)
  useEffect(() => {
    if (!focusLogin || !enrichedSnapshot) return
    const territory = enrichedSnapshot.territories.find((t) => t.login === focusLogin)
    if (!territory) return
    const island = enrichedSnapshot.islands.find((i) => i.id === territory.islandId)
    if (island) cameraTargetIslandRef.current = { island, keepDistance: true, fixedRadius: null }
  }, [focusLogin, enrichedSnapshot])

  // Intro animation for non-authenticated visitors
  const introStartedRef = useRef(false)
  const introCamInitRef = useRef(false)
  const phaseStartTimeRef = useRef(0)
  const planetGroupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (meLoading || introStartedRef.current) return
    if (!me) {
      introStartedRef.current = true
      const alreadySeen = localStorage.getItem("devplanet_intro_seen")
      if (alreadySeen) {
        setIntroPhase("done")
      } else {
        localStorage.setItem("devplanet_intro_seen", "1")
        setIntroPhase("approach")
      }
    }
  }, [me, meLoading, setIntroPhase])

  // Angle theta at end of intro (2pi = back to origin), post-intro orbit continues from here
  const postIntroThetaRef = useRef(Math.PI * 2)
  const postIntroStartTimeRef = useRef(0)
  const hasCenteredRef = useRef(false)
  const cameraTargetIslandRef = useRef<{ island: Island; keepDistance: boolean; fixedRadius: number | null } | null>(null)
  const needsFreezeRef = useRef(false)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const userInteractedRef = useRef(false)

  // Cancel camera lerp + skip intro/reveal when user starts interacting
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const onStart = () => {
      userInteractedRef.current = true
      const { introPhase } = usePlanetStore.getState()
      if (introPhase === "approach" || introPhase === "text") {
        setIntroPhase("done")
        return
      }
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
    cameraTargetIslandRef.current = { island: island, keepDistance: false, fixedRadius: null }
    hasCenteredRef.current = true
    if (usePlanetStore.getState().fromOnboarding) needsFreezeRef.current = true
  }, [enrichedSnapshot, me?.island])

  useFrame(({ clock, camera: cam }) => {
    const { introPhase } = usePlanetStore.getState()

    // Hold camera at intro start position while waiting for intro to begin (guests only)
    if (introPhase === "idle" && !me) {
      cam.position.copy(sphericalToWorld(INTRO_START_PHI, 0, INTRO_START_RADIUS))
      cam.lookAt(0, 0, 0)
      return
    }

    // Single continuous camera orbit for intro
    if (introPhase === "approach" || introPhase === "text") {
      if (!introCamInitRef.current) {
        introCamInitRef.current = true
        phaseStartTimeRef.current = clock.getElapsedTime()
        cam.position.copy(sphericalToWorld(INTRO_START_PHI, 0, INTRO_START_RADIUS))
        cam.lookAt(0, 0, 0)
      }

      const elapsed = clock.getElapsedTime() - phaseStartTimeRef.current
      const t = Math.min(elapsed / INTRO_DURATION, 1)
      // Ease-out for orbit (visible rotation from the very first frame)
      const eased = 1 - Math.pow(1 - t, 2.5)

      // Radius: approaches in ~3s
      const radiusT = Math.min(elapsed / 3.0, 1)
      const radiusEased = 1 - Math.pow(1 - radiusT, 3)
      const radius = INTRO_START_RADIUS - (INTRO_START_RADIUS - INTRO_END_RADIUS) * radiusEased

      // Theta: full 360° with ease-out (rotates fast at start, slows at end)
      const theta = Math.PI * 2 * eased

      // Phi: sweeps to cover different latitudes
      const phi = INTRO_START_PHI + Math.sin(eased * Math.PI * 2) * 0.3

      cam.position.copy(sphericalToWorld(phi, theta, radius))
      cam.lookAt(0, 0, 0)

      // Transition: show text early, end when orbit completes
      if (introPhase === "approach" && radiusT >= 1) {
        setIntroPhase("text")
      }
      if (t >= 1) {
        postIntroStartTimeRef.current = clock.getElapsedTime()
        setIntroPhase("done")
      }
      return
    }

    // Post-intro idle orbit for guests: continue orbiting camera in same direction
    if (introPhase === "done" && !me && !userInteractedRef.current) {
      const postElapsed = clock.getElapsedTime() - postIntroStartTimeRef.current
      const speed = Math.min(postElapsed / 0.3, 1) * 0.0008
      postIntroThetaRef.current += speed
      cam.position.copy(sphericalToWorld(INTRO_START_PHI, postIntroThetaRef.current, INTRO_END_RADIUS))
      cam.lookAt(0, 0, 0)
    }

    // --- Authenticated user camera centering ---
    if (needsFreezeRef.current) {
      needsFreezeRef.current = false
      setPausedAt(clock.getElapsedTime())
    }

    const target_ref = cameraTargetIslandRef.current
    if (!target_ref) return

    // Capture radius once on first frame to avoid inward drift from linear lerp
    if (target_ref.keepDistance && target_ref.fixedRadius === null) {
      target_ref.fixedRadius = cam.position.length()
    }

    const [phi, theta] = target_ref.island.anchor
    const radius = target_ref.keepDistance ? (target_ref.fixedRadius ?? CAM_DIST) : CAM_DIST
    const target = sphericalToWorld(phi, theta, radius)

    cam.position.lerp(target, LERP_FACTOR)
    // Re-normalize to fixed radius after lerp to prevent distance drift
    if (target_ref.keepDistance && target_ref.fixedRadius !== null) {
      cam.position.setLength(target_ref.fixedRadius)
    }
    cam.lookAt(0, 0, 0)

    if (cam.position.distanceTo(target) < 0.08) {
      cameraTargetIslandRef.current = null
    }
  })

  const introPhase = usePlanetStore((s) => s.introPhase)

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

      <group ref={planetGroupRef}>
        <OceanPlanet />
        {enrichedSnapshot && (
          <>
            <IslandTerritories key={enrichedSnapshot.version} snapshot={enrichedSnapshot} />
            <IslandLabels islands={enrichedSnapshot.islands} />
          </>
        )}
      </group>

      {/* 3D text sweep behind the planet */}
      {(introPhase === "approach" || introPhase === "text") && <IntroTextSweep />}

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
