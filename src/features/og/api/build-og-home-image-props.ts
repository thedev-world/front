import fs from "node:fs"
import path from "node:path"

import sharp from "sharp"

import { getBackendUrl } from "@/config/env"
import { loadAppleIconSrc } from "../lib/load-apple-icon"
import { fetchPlanetData } from "./fetch-planet-data"

export type OgHomeImageProps = {
  totalDevs: number
  totalCells: number
  islandCount: number
  developerGoal: number
  planetImageSrc: string | null
  appleIconSrc: string | null
}

type BuildResult =
  | { ok: true; props: OgHomeImageProps }
  | { ok: false; status: number; message: string }

export async function buildOgHomeImageProps(): Promise<BuildResult> {
  const base = getBackendUrl()
  const cwd = process.cwd()

  const [planetData, configRes, appleIconSrc] = await Promise.all([
    fetchPlanetData(),
    fetch(`${base}/api/v1/planet/config`).catch(() => null),
    loadAppleIconSrc(36),
  ])

  const allEntries = Object.values(planetData.islands).flat()
  const totalDevs = allEntries.length
  const totalCells = allEntries.reduce((acc, [, count]) => acc + count, 0)
  const islandCount = Object.keys(planetData.islands).length

  let developerGoal = 500
  if (configRes?.ok) {
    const config = (await configRes.json()) as { developer_goal: number }
    developerGoal = config.developer_goal
  }

  const planetPath = path.join(cwd, "public/images/og/planet-representation.png")
  let planetImageSrc: string | null = null
  if (fs.existsSync(planetPath)) {
    const buf = await sharp(planetPath)
      .resize(700, 700, { fit: "inside" })
      .jpeg({ quality: 85 })
      .toBuffer()
      .catch(() => null)
    if (buf) {
      planetImageSrc = `data:image/jpeg;base64,${buf.toString("base64")}`
    }
  }

  return {
    ok: true,
    props: { totalDevs, totalCells, islandCount, developerGoal, planetImageSrc, appleIconSrc },
  }
}
