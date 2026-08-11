"use client"

import { ChevronDown, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { HudRightDock } from "@/components/ui/hud-panel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMediaQuery } from "@/hooks/use-media-query"
import { BREAKPOINTS, mediaQuery } from "@/lib/breakpoints"
import { cn } from "@/lib/utils"

import { usePlanetLeaderboard } from "../hooks/use-planet-leaderboard"
import { usePlanetStore } from "../stores/planet-store"

import { LeaderboardMobileDialog } from "./leaderboard-mobile-dialog"
import { LeaderboardPanel } from "./leaderboard-panel"

export function PlanetLeaderboard() {
  const router = useRouter()
  const leaderboard = usePlanetLeaderboard()
  const [open, setOpen] = useState(false)
  const setFocusIslandId = usePlanetStore((s) => s.setFocusIslandId)
  const isMobile = useMediaQuery(mediaQuery.max(BREAKPOINTS.hudMobile))
  const wasMobileRef = useRef(isMobile)

  useEffect(() => {
    if (wasMobileRef.current && !isMobile && open) {
      setOpen(false)
    }
    wasMobileRef.current = isMobile
  }, [isMobile, open])

  if (!leaderboard) return null

  const { topAll, myGlobalRank, byIsland } = leaderboard

  const viewDeveloper = (login: string) => {
    setOpen(false)
    router.push(`/u/${encodeURIComponent(login)}`)
  }

  const handleAccordionChange = (value: string[]) => {
    const islandId = value.find((v) => v !== "top-10")
    setFocusIslandId(islandId ?? null)
  }

  const handleTriggerClick = () => {
    if (isMobile) {
      setOpen(true)
      return
    }
    setOpen((v) => !v)
  }

  return (
    <>
      <HudRightDock>
        <button
          onClick={handleTriggerClick}
          aria-label="Leaderboard"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full cursor-pointer items-center gap-2 px-3 text-left",
            "max-hud-mobile:size-10 max-hud-mobile:justify-center max-hud-mobile:gap-0 max-hud-mobile:px-0",
          )}
        >
          <Trophy size={12} className="shrink-0 text-amber-400" />
          <span className="max-hud-mobile:hidden flex-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-300">
            Leaderboard
          </span>
          <ChevronDown
            size={13}
            className={cn(
              "max-hud-mobile:hidden shrink-0 text-zinc-500 transition-transform duration-200",
              !open && "-rotate-90",
            )}
          />
        </button>

        {open && !isMobile && (
          <ScrollArea className="max-h-[min(60vh,28rem)] border-t border-white/[0.06]">
            <LeaderboardPanel
              topAll={topAll}
              myGlobalRank={myGlobalRank}
              byIsland={byIsland}
              onViewDeveloper={viewDeveloper}
              onAccordionChange={handleAccordionChange}
            />
          </ScrollArea>
        )}
      </HudRightDock>

      <LeaderboardMobileDialog
        open={open && isMobile}
        onOpenChange={setOpen}
        topAll={topAll}
        myGlobalRank={myGlobalRank}
        byIsland={byIsland}
        onViewDeveloper={viewDeveloper}
        onAccordionChange={handleAccordionChange}
      />
    </>
  )
}
