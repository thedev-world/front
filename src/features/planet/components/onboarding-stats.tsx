"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { usePlanetStore } from "../stores/planet-store"
import { useMyPlanetStats } from "../hooks/use-my-planet-stats"

const AUTO_DISMISS_MS = 7000
const FADE_DURATION_MS = 600

function ordinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

export function OnboardingStats() {
  const showOnboardingStats = usePlanetStore((s) => s.showOnboardingStats)
  const setShowOnboardingStats = usePlanetStore((s) => s.setShowOnboardingStats)
  const stats = useMyPlanetStats()

  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!showOnboardingStats) return

    localStorage.setItem("devplanet_stats_shown", "1")

    // Slight delay so the flash animation finishes before text appears
    const show = setTimeout(() => setVisible(true), 200)

    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => setShowOnboardingStats(false), FADE_DURATION_MS)
    }, AUTO_DISMISS_MS)

    return () => {
      clearTimeout(show)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [showOnboardingStats, setShowOnboardingStats])

  if (!showOnboardingStats || !stats) return null

  const capitalizedIsland =
    stats.islandName.charAt(0).toUpperCase() + stats.islandName.slice(1)

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-4 right-4 z-40 w-52",
        "border border-white/20 bg-black/40 shadow-2xl backdrop-blur-md",
        "px-3 py-3 transition-all",
      )}
      style={{
        transitionDuration: `${FADE_DURATION_MS}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(8px)",
      }}
    >
      <div className="flex flex-col gap-2.5">
        {/* Eyebrow */}
        <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          Territory established
        </p>

        {/* Global rank — the hero number */}
        <div className="flex flex-col gap-0.5">
          <span className="text-5xl font-bold leading-none tracking-tight text-white">
            #{stats.globalRank}
          </span>
          <span className="text-[12px] text-zinc-400">
            largest territory on DevPlanet
          </span>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-white/10" />

        {/* Island rank + cells */}
        <p className="text-[11px] leading-relaxed text-zinc-500">
          <span className="text-zinc-300">{ordinalSuffix(stats.islandRank)}</span>
          {" on "}
          <span className="text-zinc-300">{capitalizedIsland} Island</span>
          {"  -  "}
          <span className="text-zinc-300">{stats.cellCount}</span>
          {" cells claimed"}
        </p>
      </div>
    </div>
  )
}
