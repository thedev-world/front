"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { usePlanetStore } from "../stores/planet-store"
import { useMyPlanetStats } from "../hooks/use-my-planet-stats"
import type { MyPlanetStats } from "../hooks/use-my-planet-stats"

const AUTO_DISMISS_MS = 7000
const FADE_DURATION_MS = 600
const LINE_DRAW_MS = 450
const CARD_DELAY_MS = LINE_DRAW_MS + 100

function ordinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

export function OnboardingStats() {
  const showOnboardingStats = usePlanetStore((s) => s.showOnboardingStats)
  const setShowOnboardingStats = usePlanetStore((s) => s.setShowOnboardingStats)
  const stats = useMyPlanetStats()

  if (!showOnboardingStats || !stats) return null

  return (
    <OnboardingStatsOverlay
      stats={stats}
      onDismiss={() => setShowOnboardingStats(false)}
    />
  )
}

function OnboardingStatsOverlay({
  stats,
  onDismiss,
}: {
  stats: MyPlanetStats
  onDismiss: () => void
}) {
  const planetInteracted = usePlanetStore((s) => s.planetInteracted)
  const setPlanetInteracted = usePlanetStore((s) => s.setPlanetInteracted)

  const [lineVisible, setLineVisible] = useState(true)
  const [connectorShown, setConnectorShown] = useState(true)
  const [cardVisible, setCardVisible] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const cardRef = useRef<HTMLDivElement>(null)

  const schedule = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay)
    timersRef.current.push(id)
    return id
  }

  useEffect(() => {
    localStorage.setItem("thedevworld_stats_shown", "1")

    schedule(() => setCardVisible(true), CARD_DELAY_MS)

    schedule(() => {
      setCardVisible(false)
      setConnectorShown(false)
      schedule(() => {
        setLineVisible(false)
        schedule(onDismiss, FADE_DURATION_MS)
      }, FADE_DURATION_MS)
    }, AUTO_DISMISS_MS)

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [onDismiss])

  // Hide the connector line when the user drags the planet (card stays visible)
  useEffect(() => {
    if (!planetInteracted || !lineVisible) return
    setPlanetInteracted(false)
    schedule(() => setConnectorShown(false), 0)
    schedule(() => setLineVisible(false), FADE_DURATION_MS)
  }, [planetInteracted, lineVisible, setPlanetInteracted])

  const capitalizedIsland =
    stats.islandName.charAt(0).toUpperCase() + stats.islandName.slice(1)

  return (
    <>
      {lineVisible && (
        <TerritoryConnector show={connectorShown} cardRef={cardRef} />
      )}

      <div
        ref={cardRef}
        className={cn(
          "pointer-events-none absolute bottom-12 right-12 z-40 w-52",
          "border border-white/20 bg-black/40 shadow-2xl backdrop-blur-md",
          "px-3 py-3 transition-all",
        )}
        style={{
          transitionDuration: `${FADE_DURATION_MS}ms`,
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? "translateX(0)" : "translateX(8px)",
        }}
      >
        <div className="flex flex-col gap-2.5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            Your territory
          </p>

          <div className="flex flex-col gap-0.5">
            <span className="text-5xl font-bold leading-none tracking-tight text-white">
              #{stats.globalRank}
            </span>
            <span className="text-[12px] text-zinc-400">
              largest territory in the dev world
            </span>
          </div>

          <div className="h-px w-full bg-white/10" />

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
    </>
  )
}

function TerritoryConnector({
  show,
  cardRef,
}: {
  show: boolean
  cardRef: React.RefObject<HTMLDivElement | null>
}) {
  const myTerritoryScreenPos = usePlanetStore((s) => s.myTerritoryScreenPos)

  const [path, setPath] = useState("")
  const [drawn, setDrawn] = useState(false)
  const pathComputedRef = useRef(false)

  // Poll once on mount until territory position + card ref are ready.
  // myTerritoryScreenPos updates every ~16ms — we read it via ref to avoid
  // re-running this effect and cancelling the pending path computation.
  useEffect(() => {
    if (pathComputedRef.current) return

    let cancelled = false
    let rafId = 0

    const tryCompute = () => {
      if (cancelled || pathComputedRef.current) return

      const pos = usePlanetStore.getState().myTerritoryScreenPos
      if (!pos || !cardRef.current) {
        rafId = requestAnimationFrame(tryCompute)
        return
      }

      const rect = cardRef.current.getBoundingClientRect()
      const cardX = rect.left
      const cardY = rect.top + rect.height / 2
      const dx = Math.abs(cardY - pos.y)
      const interX = pos.x + (cardX > pos.x ? dx : -dx)
      const computed = `M ${pos.x} ${pos.y} L ${interX} ${cardY} L ${cardX} ${cardY}`

      pathComputedRef.current = true
      setPath(computed)
    }

    rafId = requestAnimationFrame(tryCompute)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    }
  }, [cardRef])

  // Trigger the draw animation once the path is set.
  // Kept separate from the effect above so myTerritoryScreenPos updates don't cancel the RAF.
  useEffect(() => {
    if (!path) return
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawn(true))
    })
    return () => cancelAnimationFrame(raf1)
  }, [path])

  if (!path) return null

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      style={{
        filter: "drop-shadow(0 0 4px rgba(255,255,255,0.3))",
        opacity: show ? 1 : 0,
        transition: `opacity ${FADE_DURATION_MS}ms`,
      }}
    >
      <path
        d={path}
        fill="none"
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.4"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={drawn ? "0" : "1"}
        style={{ transition: drawn ? `stroke-dashoffset ${LINE_DRAW_MS}ms ease-out` : "none" }}
      />
      {myTerritoryScreenPos && (
        <circle
          cx={myTerritoryScreenPos.x}
          cy={myTerritoryScreenPos.y}
          r="2"
          fill="white"
          fillOpacity={drawn ? "0.8" : "0"}
          style={{ transition: drawn ? `fill-opacity 0.2s ease-out ${LINE_DRAW_MS}ms` : "none" }}
        />
      )}
    </svg>
  )
}
