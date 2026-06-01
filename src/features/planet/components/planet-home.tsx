"use client"

import dynamic from "next/dynamic"

import { usePlanetData } from "../api/use-planet-data"

const PlanetCanvas = dynamic(
  () =>
    import("./planet-canvas").then((mod) => ({
      default: mod.PlanetCanvas,
    })),
  { ssr: false },
)

export function PlanetHome() {
  const { isPending } = usePlanetData()

  return (
    <div className="relative h-full w-full">
      {/* Loading indicator */}
      {isPending && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <p className="text-sm text-zinc-400">Loading planet…</p>
          </div>
        </div>
      )}

      {/* 3D Canvas — full screen */}
      <div className="h-full w-full">
        <PlanetCanvas />
      </div>

      <div className="absolute bottom-4 left-4 z-40">
        <h1 className="text-lg font-semibold tracking-tight text-white/80">
          Devplanet
        </h1>
        <p className="text-xs text-zinc-500">
          Explore developer territories
        </p>
      </div>
    </div>
  )
}
