import { BREAKPOINTS } from "@/lib/breakpoints"

export type PlanetCameraLayout = {
  scale: number
  camDist: number
  profileCamDist: number
  introEndRadius: number
  minDistance: number
  maxDistance: number
  fov: number
  profileViewShift: number
}

/** Desktop camera defaults, keep in sync with planet-scene usage. */
export const PLANET_CAMERA_BASE = {
  camDist: 16,
  profileCamDist: 11,
  introEndRadius: 16,
  minDistance: 7,
  maxDistance: 30,
  fov: 50,
  profileViewShift: 0.34,
} as const

const MOBILE_MIN_VIEWPORT = 375
const MAX_SCALE = 1.55
const FOV_SCALE_FACTOR = 18

function computeScale(viewportMin: number): number {
  if (viewportMin >= BREAKPOINTS.hudMobile) return 1

  if (viewportMin <= MOBILE_MIN_VIEWPORT) return MAX_SCALE

  const t =
    (BREAKPOINTS.hudMobile - viewportMin) /
    (BREAKPOINTS.hudMobile - MOBILE_MIN_VIEWPORT)

  return 1 + t * (MAX_SCALE - 1)
}

function computeProfileViewShift(viewportMin: number): number {
  if (viewportMin >= BREAKPOINTS.hudMobile) return PLANET_CAMERA_BASE.profileViewShift
  return 0
}

export function buildPlanetCameraLayout(
  scale: number,
  viewportMin: number,
): PlanetCameraLayout {
  const { camDist, profileCamDist, introEndRadius, minDistance, maxDistance, fov } =
    PLANET_CAMERA_BASE

  return {
    scale,
    camDist: camDist * scale,
    profileCamDist: profileCamDist * scale,
    introEndRadius: introEndRadius * scale,
    minDistance: minDistance * scale,
    maxDistance: maxDistance * scale,
    fov: fov + (scale - 1) * FOV_SCALE_FACTOR,
    profileViewShift: computeProfileViewShift(viewportMin),
  }
}

export function getPlanetCameraLayout(viewportMin: number): PlanetCameraLayout {
  return buildPlanetCameraLayout(computeScale(viewportMin), viewportMin)
}
