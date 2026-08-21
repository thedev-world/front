import { describe, expect, it } from "vitest"

import { buildPlanetSnapshot } from "./island-placement"
import type { PlanetApiResponse } from "../types/snapshot"

function makeFrontendIsland(devs: [string, number][]): PlanetApiResponse {
  return { updated_at: "test-v1", islands: { frontend: devs } }
}

function makeMultiIsland(
  islandSizes: Record<string, number>,
): PlanetApiResponse {
  const islands: Record<string, [string, number][]> = {}
  for (const [id, count] of Object.entries(islandSizes)) {
    islands[id] = Array.from({ length: count }, (_, i) => [
      `${id}_dev_${i}`,
      Math.floor(Math.random() * 30) + 2,
    ])
  }
  return { updated_at: "test-multi", islands }
}

describe("buildPlanetSnapshot — territory growth", () => {
  it("every territory gets the exact cellCount requested", () => {
    const devs: [string, number][] = [
      ["dev_a", 81],
      ["dev_b", 43],
      ["dev_c", 68],
      ["dev_d", 37],
      ["dev_e", 29],
      ["dev_f", 3],
      ["dev_g", 2],
    ]
    const snapshot = buildPlanetSnapshot(makeFrontendIsland(devs))
    for (const t of snapshot.territories) {
      expect(t.cells.length).toBe(t.cellCount)
    }
  })

  it("handles 75+ developers on a single island without mismatches", () => {
    const devs: [string, number][] = Array.from({ length: 78 }, (_, i) => [
      `fake_dev_${String(i).padStart(3, "0")}`,
      i === 66 ? 68 : Math.floor(Math.random() * 15) + 2,
    ])
    const snapshot = buildPlanetSnapshot(makeFrontendIsland(devs))
    for (const t of snapshot.territories) {
      expect(t.cells.length).toBe(t.cellCount)
    }
  })

  it("produces no severe interior holes (surrounded on 6 sides)", () => {
    const devs: [string, number][] = Array.from({ length: 50 }, (_, i) => [
      `dev_${i}`,
      (i * 7 + 3) % 25 + 3,
    ])
    const snapshot = buildPlanetSnapshot(makeFrontendIsland(devs))

    const occupied = new Set<string>()
    snapshot.territories.forEach((t) =>
      t.cells.forEach((c) => occupied.add(`${c.q},${c.r}`)),
    )

    let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity
    for (const key of occupied) {
      const [q, r] = key.split(",").map(Number)
      minQ = Math.min(minQ, q); maxQ = Math.max(maxQ, q)
      minR = Math.min(minR, r); maxR = Math.max(maxR, r)
    }

    let fullyEnclosed = 0
    for (let q = minQ; q <= maxQ; q++) {
      for (let r = minR; r <= maxR; r++) {
        if (occupied.has(`${q},${r}`)) continue
        let occ = 0
        for (const [dq, dr] of [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]]) {
          if (occupied.has(`${q + dq},${r + dr}`)) occ++
        }
        if (occ === 6) fullyEnclosed++
      }
    }
    // No cell should be fully enclosed (surrounded on all 6 sides)
    expect(fullyEnclosed).toBe(0)
  })

  it("handles multiple islands without territory starvation", () => {
    const apiResponse = makeMultiIsland({
      frontend: 75,
      backend: 60,
      "ai-ml": 50,
      devops: 40,
      mobile: 35,
    })
    const snapshot = buildPlanetSnapshot(apiResponse)

    expect(snapshot.territories.length).toBe(260)
    for (const t of snapshot.territories) {
      expect(t.cells.length).toBe(t.cellCount)
    }
  })

  it("positional stability: adding a dev at end doesn't move existing devs", () => {
    const devs: [string, number][] = [
      ["alice", 20],
      ["bob", 15],
      ["charlie", 10],
    ]
    const snap1 = buildPlanetSnapshot(makeFrontendIsland(devs))

    const devsExtended: [string, number][] = [...devs, ["newcomer", 8]]
    const snap2 = buildPlanetSnapshot(makeFrontendIsland(devsExtended))

    // First 3 territories should have identical cells (same seed, same BFS)
    for (let i = 0; i < 3; i++) {
      const cells1 = snap1.territories[i].cells.slice(0, snap1.territories[i].cellCount)
      const cells2 = snap2.territories[i].cells.slice(0, snap2.territories[i].cellCount)
      expect(cells1).toEqual(cells2)
    }
  })

  it("avoids bloated planet at high density", () => {
    const apiResponse = makeMultiIsland({
      frontend: 600,
      backend: 600,
      "ai-ml": 600,
      devops: 600,
      mobile: 600,
    })
    const snapshot = buildPlanetSnapshot(apiResponse)

    expect(snapshot.planetRadius).toBeLessThanOrEqual(7)
    expect(snapshot.cellSize).toBeLessThan(0.04)
  })

  it("builds in under 200ms for a large planet (260 territories)", () => {
    const apiResponse = makeMultiIsland({
      frontend: 75,
      backend: 60,
      "ai-ml": 50,
      devops: 40,
      mobile: 35,
    })
    const start = performance.now()
    buildPlanetSnapshot(apiResponse)
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(200)
  })
})
