import { describe, expect, it } from "vitest"

import {
  BADGE_BY_SLUG,
  computeRankSpineProgress,
  type PlayerClassMeta,
} from "./player-class"

const CLASSES: PlayerClassMeta[] = [
  { slug: "seedling", name: "Seedling", tier: 1, requiredLevel: 1, badge: BADGE_BY_SLUG.seedling, phrase: "" },
  { slug: "builder", name: "Builder", tier: 2, requiredLevel: 5, badge: BADGE_BY_SLUG.builder, phrase: "" },
  { slug: "crafter", name: "Crafter", tier: 3, requiredLevel: 10, badge: BADGE_BY_SLUG.crafter, phrase: "" },
  { slug: "architect", name: "Architect", tier: 4, requiredLevel: 20, badge: BADGE_BY_SLUG.architect, phrase: "" },
  { slug: "maintainer", name: "Maintainer", tier: 5, requiredLevel: 35, badge: BADGE_BY_SLUG.maintainer, phrase: "" },
  { slug: "legend", name: "Legend", tier: 6, requiredLevel: 55, badge: BADGE_BY_SLUG.legend, phrase: "" },
  { slug: "sovereign", name: "Sovereign", tier: 7, requiredLevel: 80, badge: BADGE_BY_SLUG.sovereign, phrase: "" },
  { slug: "founder", name: "Founder", tier: 8, requiredLevel: 100, badge: BADGE_BY_SLUG.founder, phrase: "" },
]

const MAINTAINER = CLASSES[4]!
const FOUNDER = CLASSES[7]!

describe("computeRankSpineProgress", () => {
  it("uses inter-tier level progress for Maintainer level 41", () => {
    const progress = computeRankSpineProgress(41, MAINTAINER, CLASSES)
    expect(progress).toBeCloseTo((4 + 0.3) / 7, 5)
    expect(progress).toBeLessThan(0.65)
    expect(progress).not.toBeCloseTo((4 + 0.86) / 7, 2)
  })

  it("is almost at Legend when one level away", () => {
    const progress = computeRankSpineProgress(54, MAINTAINER, CLASSES)
    expect(progress).toBeCloseTo((4 + 0.95) / 7, 5)
  })

  it("fills the rail on the final tier", () => {
    const progress = computeRankSpineProgress(100, FOUNDER, CLASSES)
    expect(progress).toBe(1)
  })
})
