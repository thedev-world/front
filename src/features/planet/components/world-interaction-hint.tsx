"use client"

import {
  ArrowsHorizontalIcon,
  ArrowsOutSimpleIcon,
  HandSwipeRightIcon,
  MouseScrollIcon,
} from "@phosphor-icons/react"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { useMe } from "@/features/auth/api/use-me"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

import { usePlanetData } from "../api/use-planet-data"
import { isWorldInteractionHintDismissed } from "../lib/world-interaction-hint-storage"
import { usePlanetStore } from "../stores/planet-store"

type InteractionHintPhase = "inactive" | "waiting" | "visible" | "dismissing"

const ENTER_DELAY_MIN_MS = 800
const ENTER_DELAY_MAX_MS = 1200
const EXIT_ANIMATION_MS = 200

const ICON_PROPS = {
  size: 14,
  weight: "regular" as const,
  "aria-hidden": true,
}

function getInitialPhase(): InteractionHintPhase {
  if (typeof window === "undefined") return "inactive"
  if (isWorldInteractionHintDismissed()) return "inactive"
  if (usePlanetStore.getState().worldExplorationStarted) return "inactive"
  return "waiting"
}

function randomEnterDelayMs(): number {
  return (
    ENTER_DELAY_MIN_MS +
    Math.floor(Math.random() * (ENTER_DELAY_MAX_MS - ENTER_DELAY_MIN_MS + 1))
  )
}

function HintItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-hi/80">{icon}</span>
      <span className="text-zinc-300">{label}</span>
    </span>
  )
}

function HudCornerBrackets({ children }: { children: ReactNode }) {
  return (
    <div className="relative inline-flex items-center px-2.5 py-1">
      <span
        className="pointer-events-none absolute left-0 top-0 h-1.5 w-1.5 border-l border-t border-hi/50"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute right-0 top-0 h-1.5 w-1.5 border-r border-t border-hi/50"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-hi/50"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-hi/50"
        aria-hidden="true"
      />
      {children}
    </div>
  )
}

export function WorldInteractionHint() {
  const { isPending } = usePlanetData()
  const { data: me, isLoading: meLoading } = useMe()
  const introPhase = usePlanetStore((s) => s.introPhase)
  const worldExplorationStarted = usePlanetStore((s) => s.worldExplorationStarted)
  const isCoarsePointer = useMediaQuery("(pointer: coarse)")

  const [phase, setPhase] = useState<InteractionHintPhase>(getInitialPhase)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isGuest = !meLoading && !me
  const isEligible =
    phase === "waiting" &&
    !isPending &&
    !isWorldInteractionHintDismissed() &&
    !worldExplorationStarted &&
    (isGuest
      ? introPhase === "text" || introPhase === "done"
      : !meLoading && !!me)

  useEffect(() => {
    if (!isEligible) return

    const enterTimer = setTimeout(() => {
      setPhase("visible")
    }, randomEnterDelayMs())

    return () => clearTimeout(enterTimer)
  }, [isEligible])

  useEffect(() => {
    return usePlanetStore.subscribe((state, prevState) => {
      if (!state.worldExplorationStarted || prevState.worldExplorationStarted) return

      setPhase((current) => {
        if (current === "waiting" || current === "inactive") return "inactive"
        if (current === "visible") {
          if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
          exitTimerRef.current = setTimeout(() => {
            setPhase("inactive")
          }, EXIT_ANIMATION_MS)
          return "dismissing"
        }
        return current
      })
    })
  }, [])

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    }
  }, [])

  if (phase === "inactive" || phase === "waiting") return null

  const hintText = isCoarsePointer
    ? "Swipe to explore · Pinch to zoom"
    : "Drag to explore · Scroll to zoom"

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 z-40 flex justify-center",
        "bottom-10 max-hud-mobile:bottom-auto max-hud-mobile:top-22",
      )}
      role="status"
      aria-live="polite"
    >
      <HudCornerBrackets>
        <div
          className={cn(
            "flex h-9 max-w-[520px] items-center justify-center gap-3 sm:h-10",
            "max-hud-mobile:max-w-[min(520px,88vw)] max-hud-mobile:gap-2",
            "ticker text-[10px] uppercase tracking-[0.22em] text-zinc-400",
            "max-hud-mobile:tracking-[0.16em]",
            phase === "visible" && "anim-world-hint-in",
            phase === "dismissing" && "anim-world-hint-out",
          )}
        >
          {isCoarsePointer ? (
            <>
              <HintItem
                icon={<HandSwipeRightIcon {...ICON_PROPS} />}
                label="Swipe to explore"
              />
              <span className="text-zinc-600" aria-hidden="true">
                ·
              </span>
              <HintItem
                icon={<ArrowsOutSimpleIcon {...ICON_PROPS} />}
                label="Pinch to zoom"
              />
            </>
          ) : (
            <>
              <HintItem
                icon={<ArrowsHorizontalIcon {...ICON_PROPS} />}
                label="Drag to explore"
              />
              <span className="text-zinc-600" aria-hidden="true">
                ·
              </span>
              <HintItem
                icon={<MouseScrollIcon {...ICON_PROPS} />}
                label="Scroll to zoom"
              />
            </>
          )}
          <span className="sr-only">{hintText}</span>
        </div>
      </HudCornerBrackets>
    </div>
  )
}
