"use client"

import { useEffect } from "react"

import { usePlanetData } from "@/features/planet/api/use-planet-data"
import { usePlanetStore } from "@/features/planet/stores/planet-store"

export function CaptureReadySignal() {
  const { isPending } = usePlanetData()
  const cameraSettled = usePlanetStore((s) => s.cameraSettled)

  useEffect(() => {
    if (isPending || !cameraSettled) return

    // Wait 2 frames so the GPU has composited the final render before signalling.
    let raf1 = 0
    let raf2 = 0
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        ;(window as { __PLANET_READY?: boolean }).__PLANET_READY = true
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [isPending, cameraSettled])

  return null
}
