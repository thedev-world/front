import { describe, expect, it } from "vitest"

import {
  getPlanetCameraLayout,
  PLANET_CAMERA_BASE,
} from "./planet-camera-layout"

describe("getPlanetCameraLayout", () => {
  it("returns desktop defaults above hudMobile breakpoint", () => {
    const layout = getPlanetCameraLayout(1153)

    expect(layout.scale).toBe(1)
    expect(layout.camDist).toBe(PLANET_CAMERA_BASE.camDist)
    expect(layout.profileCamDist).toBe(PLANET_CAMERA_BASE.profileCamDist)
    expect(layout.introEndRadius).toBe(PLANET_CAMERA_BASE.introEndRadius)
    expect(layout.minDistance).toBe(PLANET_CAMERA_BASE.minDistance)
    expect(layout.maxDistance).toBe(PLANET_CAMERA_BASE.maxDistance)
    expect(layout.fov).toBe(PLANET_CAMERA_BASE.fov)
    expect(layout.profileViewShift).toBe(PLANET_CAMERA_BASE.profileViewShift)
  })

  it("starts scaling at hudMobile breakpoint boundary", () => {
    expect(getPlanetCameraLayout(614).scale).toBe(1)
    expect(getPlanetCameraLayout(613).scale).toBeGreaterThan(1)
  })

  it("reaches max scale at smallest mobile viewport", () => {
    const layout = getPlanetCameraLayout(375)

    expect(layout.scale).toBe(1.55)
    expect(layout.camDist).toBeCloseTo(16 * 1.55)
    expect(layout.fov).toBeCloseTo(50 + 0.55 * 18)
    expect(layout.profileViewShift).toBe(0)
  })

  it("interpolates between mobile breakpoints", () => {
    const layout = getPlanetCameraLayout(500)

    expect(layout.scale).toBeGreaterThan(1)
    expect(layout.scale).toBeLessThan(1.55)
    expect(layout.profileViewShift).toBe(0)
  })
})
