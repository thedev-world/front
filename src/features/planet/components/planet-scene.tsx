"use client"

import { OrbitControls } from "@react-three/drei"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"

import { useMe } from "@/features/auth/api/use-me"
import { useEnrichedPlanetData } from "../api/use-enriched-planet-data"
import {
  buildPlanetCameraLayout,
  getPlanetCameraLayout,
  PLANET_CAMERA_BASE,
  type PlanetCameraLayout,
} from "../lib/planet-camera-layout"
import { sphericalToWorld } from "../lib/planet-projection"
import { usePlanetStore } from "../stores/planet-store"
import type { Island } from "../types/snapshot"

import { IntroTextSweep } from "./intro-text-sweep"
import { IslandLabels } from "./island-labels"
import { IslandTerritories } from "./island-territories"
import { OceanPlanet } from "./ocean-planet"
import { StarField } from "./star-field"
import { TerritoryPositionTracker } from "./territory-position-tracker"

/**
 * Azimuth offset (radians) applied in profile mode so the focused territory
 * sits left of the planet centre (leaving room beside the card).
 */
const PROFILE_YAW_OFFSET = 0.32
/** Lerp factor per frame — ~2s to reach target at 60fps. */
const LERP_FACTOR = 0.04

type CameraTarget = {
  island: Island
  keepDistance: boolean
  fixedRadius: number | null
  /** Extra azimuth applied to the island anchor (profile framing). */
  yawOffset: number
}

// Intro animation constants — single continuous camera motion
const INTRO_DURATION = 8.0
const INTRO_START_RADIUS = 50
const INTRO_START_PHI = Math.PI / 2.5

export function PlanetScene() {
  const { data: enrichedSnapshot } = useEnrichedPlanetData()
  const { data: me, isLoading: meLoading } = useMe()

  const {
    setPausedAt,
    setHighlightedGithubLogin,
    setSkipReveal,
    setIntroPhase,
    setPlanetInteracted,
    setCameraSettled,
  } = usePlanetStore()

  // Reactive selectors for leaderboard focus
  const focusIslandId = usePlanetStore((s) => s.focusIslandId)
  const focusGithubLogin = usePlanetStore((s) => s.focusGithubLogin)
  const viewedGithubLogin = usePlanetStore((s) => s.viewedGithubLogin)
  const setFocusGithubLogin = usePlanetStore((s) => s.setFocusGithubLogin)

  const introStartedRef = useRef(false)
  const introCamInitRef = useRef(false)
  const phaseStartTimeRef = useRef(0)
  const planetGroupRef = useRef<THREE.Group>(null)
  const postIntroThetaRef = useRef(Math.PI * 2)
  const postIntroStartTimeRef = useRef(0)
  const hasCenteredRef = useRef(false)
  const cameraTargetIslandRef = useRef<CameraTarget | null>(null)
  const needsFreezeRef = useRef(false)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const userInteractedRef = useRef(false)
  const profileOffsetRef = useRef(0)
  const viewOffsetActiveRef = useRef(false)
  /** Camera radius before entering profile mode — restored on back. */
  const preProfileRadiusRef = useRef<number | null>(null)
  /** Island framed during profile — used to reverse yaw/zoom on exit. */
  const profileIslandRef = useRef<Island | null>(null)
  const layoutRef = useRef<PlanetCameraLayout>(getPlanetCameraLayout(1920))
  const scaleRef = useRef(1)

  // Always highlight the logged-in user's territory
  useEffect(() => {
    if (me?.github_login) setHighlightedGithubLogin(me.github_login)
  }, [me?.github_login, setHighlightedGithubLogin])

  // Camera focus triggered by leaderboard island accordion
  useEffect(() => {
    if (!focusIslandId || !enrichedSnapshot) return
    const island = enrichedSnapshot.islands.find((i) => i.id === focusIslandId)
    if (island) {
      cameraTargetIslandRef.current = {
        island,
        keepDistance: true,
        fixedRadius: null,
        yawOffset: 0,
      }
    }
  }, [focusIslandId, enrichedSnapshot])

  // Camera focus triggered by leaderboard row click (navigate to user's island)
  useEffect(() => {
    if (!focusGithubLogin || !enrichedSnapshot) return
    // Profile mode owns the camera (closer zoom) — skip the leaderboard focus lerp.
    if (usePlanetStore.getState().viewedGithubLogin) return
    const territory = enrichedSnapshot.territories.find((t) => t.githubLogin === focusGithubLogin)
    if (!territory) return
    const island = enrichedSnapshot.islands.find((i) => i.id === territory.islandId)
    if (island) {
      cameraTargetIslandRef.current = {
        island,
        keepDistance: true,
        fixedRadius: null,
        yawOffset: 0,
      }
    }
  }, [focusGithubLogin, enrichedSnapshot])

  // Profile view (/u/{login}): zoom + yaw-framed island; reverse on exit.
  useEffect(() => {
    if (!enrichedSnapshot) return

    if (!viewedGithubLogin) {
      setFocusGithubLogin(null)
      // Reverse the profile zoom back to the radius captured on enter.
      const exitIsland = profileIslandRef.current
      const exitRadius = preProfileRadiusRef.current
      if (exitIsland && exitRadius !== null) {
        cameraTargetIslandRef.current = {
          island: exitIsland,
          keepDistance: true,
          fixedRadius: exitRadius,
          yawOffset: 0,
        }
      }
      profileIslandRef.current = null
      preProfileRadiusRef.current = null
      return
    }

    const loginLower = viewedGithubLogin.toLowerCase()
    const territory = enrichedSnapshot.territories.find(
      (t) => t.githubLogin.toLowerCase() === loginLower,
    )
    if (!territory) return
    const island = enrichedSnapshot.islands.find((i) => i.id === territory.islandId)
    if (!island) return

    // Capture current zoom once so "back" can restore it.
    if (preProfileRadiusRef.current === null) {
      const controls = controlsRef.current
      preProfileRadiusRef.current = controls
        ? controls.getDistance()
        : layoutRef.current.camDist
    }
    profileIslandRef.current = island

    cameraTargetIslandRef.current = {
      island,
      keepDistance: true,
      fixedRadius: layoutRef.current.profileCamDist,
      yawOffset: PROFILE_YAW_OFFSET,
    }
    setFocusGithubLogin(territory.githubLogin)
  }, [viewedGithubLogin, enrichedSnapshot, setFocusGithubLogin])

  // Intro animation for non-authenticated visitors
  useEffect(() => {
    if (meLoading || introStartedRef.current) return
    // Deep-link to a profile (/u/{login}): skip the cinematic intro, focus straight away.
    if (usePlanetStore.getState().viewedGithubLogin) {
      introStartedRef.current = true
      setIntroPhase("done")
      return
    }
    if (!me) {
      introStartedRef.current = true
      const alreadySeen = localStorage.getItem("thedevworld_intro_seen")
      if (alreadySeen) {
        setIntroPhase("done")
      } else {
        localStorage.setItem("thedevworld_intro_seen", "1")
        setIntroPhase("approach")
      }
    }
  }, [me, meLoading, setIntroPhase])

  // Cancel camera lerp + skip intro/reveal when user starts interacting
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const onStart = () => {
      userInteractedRef.current = true
      setPlanetInteracted(true)
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
  // controlsRef.current is set synchronously before this effect runs (same render cycle).
  // Zustand setters (setSkipReveal, setIntroPhase, setPlanetInteracted) are stable references.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!enrichedSnapshot || !me?.island || hasCenteredRef.current) return
    // Profile deep-link / open card owns the camera — don't overwrite the zoom.
    if (usePlanetStore.getState().viewedGithubLogin) {
      hasCenteredRef.current = true
      return
    }
    const island = enrichedSnapshot.islands.find((i) => i.id === me.island)
    if (!island) return
    cameraTargetIslandRef.current = {
      island,
      keepDistance: false,
      fixedRadius: null,
      yawOffset: 0,
    }
    hasCenteredRef.current = true
    if (usePlanetStore.getState().fromOnboarding) needsFreezeRef.current = true
  }, [enrichedSnapshot, me?.island, viewedGithubLogin])

  useFrame(({ clock, camera: cam, size }) => {
    const { introPhase, viewedGithubLogin } = usePlanetStore.getState()
    const viewportMin = Math.min(size.width, size.height)
    const targetScale = getPlanetCameraLayout(viewportMin).scale
    scaleRef.current += (targetScale - scaleRef.current) * 0.12
    const layout = buildPlanetCameraLayout(scaleRef.current, viewportMin)
    layoutRef.current = layout

    const perspCam = cam as THREE.PerspectiveCamera
    if (perspCam.fov !== layout.fov) {
      perspCam.fov = layout.fov
      perspCam.updateProjectionMatrix()
    }

    const controls = controlsRef.current
    if (controls) {
      controls.minDistance = layout.minDistance
      controls.maxDistance = layout.maxDistance
    }

    // Lateral shift: slide the planet to the right while a dossier card is open.
    const offsetTarget = viewedGithubLogin ? 1 : 0
    profileOffsetRef.current += (offsetTarget - profileOffsetRef.current) * 0.06
    const off = profileOffsetRef.current
    if (off > 0.001) {
      // Negative x offset shifts rendered content to the right on screen.
      perspCam.setViewOffset(
        size.width,
        size.height,
        -size.width * layout.profileViewShift * off,
        0,
        size.width,
        size.height,
      )
      viewOffsetActiveRef.current = true
    } else if (viewOffsetActiveRef.current) {
      perspCam.clearViewOffset()
      viewOffsetActiveRef.current = false
    }

    // Hold camera at intro start position while waiting for intro to begin (guests only).
    // Skip when a developer is being viewed so deep-links can zoom immediately.
    if (introPhase === "idle" && !me && !viewedGithubLogin) {
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
      const radius = INTRO_START_RADIUS - (INTRO_START_RADIUS - layout.introEndRadius) * radiusEased

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
    const { focusIslandId, focusGithubLogin } = usePlanetStore.getState()
    if (focusIslandId || focusGithubLogin) userInteractedRef.current = true

    if (
      introPhase === "done" &&
      !me &&
      !userInteractedRef.current &&
      !cameraTargetIslandRef.current
    ) {
      const postElapsed = clock.getElapsedTime() - postIntroStartTimeRef.current
      const speed = Math.min(postElapsed / 0.3, 1) * 0.0008
      postIntroThetaRef.current += speed
      cam.position.copy(sphericalToWorld(INTRO_START_PHI, postIntroThetaRef.current, layout.introEndRadius))
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
    const radius = target_ref.keepDistance ? (target_ref.fixedRadius ?? layout.camDist) : layout.camDist
    // Positive yawOffset orbits the camera so the territory sits left of centre.
    const target = sphericalToWorld(phi, theta + target_ref.yawOffset, radius)

    // SLERP on direction + lerp on radius so the camera arcs around the planet
    const currentDir = cam.position.clone().normalize()
    const targetDir = target.clone().normalize()
    const currentRadius = cam.position.length()
    currentDir.lerp(targetDir, LERP_FACTOR).normalize()
    const lerpedRadius = THREE.MathUtils.lerp(currentRadius, radius, LERP_FACTOR)
    cam.position.copy(currentDir.multiplyScalar(lerpedRadius))

    cam.lookAt(0, 0, 0)

    if (cam.position.distanceTo(target) < 0.08) {
      setCameraSettled(true)
      // Keep dossier framing locked so deep-links stay zoomed after settle.
      if (!(viewedGithubLogin && target_ref.yawOffset !== 0)) {
        cameraTargetIslandRef.current = null
      }
    }
  })

  const introPhase = usePlanetStore((s) => s.introPhase)

  return (
    <>
      <ambientLight intensity={0.45} color="#c8ddf5" />
      <directionalLight position={[8, 5, 4]} intensity={1.7} color="#ffffff" />
      <directionalLight position={[-6, 2, -5]} intensity={0.4} color="#d0eeff" />
      <directionalLight position={[0, -6, 6]} intensity={0.25} color="#e8f4ff" />

      {/* Subtle rim light from behind for atmosphere edge glow */}
      <pointLight position={[0, 0, -15]} intensity={0.3} color="#38bdf8" />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={PLANET_CAMERA_BASE.minDistance}
        maxDistance={PLANET_CAMERA_BASE.maxDistance}
        zoomSpeed={0.5}
        rotateSpeed={0.4}
        dampingFactor={0.08}
        enableDamping
        makeDefault
      />

      <StarField />

      <group ref={planetGroupRef}>
        <OceanPlanet planetRadius={enrichedSnapshot?.planetRadius} />
        {enrichedSnapshot && (
          <>
            <IslandTerritories key={enrichedSnapshot.version} snapshot={enrichedSnapshot} />
            <IslandLabels
              islands={enrichedSnapshot.islands}
              planetRadius={enrichedSnapshot.planetRadius}
            />
          </>
        )}
      </group>

      {/* 3D text sweep behind the planet */}
      {(introPhase === "approach" || introPhase === "text") && <IntroTextSweep />}

      {/* Tracker for the authenticated user's territory screen position */}
      {enrichedSnapshot && me?.island && (
        <TerritoryPositionTracker
          island={enrichedSnapshot.islands.find((i) => i.id === me.island)}
          territory={enrichedSnapshot.territories.find((t) => t.githubLogin === me.github_login)}
          cellSize={enrichedSnapshot.cellSize}
          planetRadius={enrichedSnapshot.planetRadius}
        />
      )}

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.82}
          intensity={0.35}
          radius={0.7}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}
