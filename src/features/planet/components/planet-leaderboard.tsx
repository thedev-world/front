"use client"

import { ChevronDown, Search, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { HudRightDock } from "@/components/ui/hud-panel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMediaQuery } from "@/hooks/use-media-query"
import { BREAKPOINTS, mediaQuery } from "@/lib/breakpoints"
import { cn } from "@/lib/utils"

import { useEnrichedPlanetData } from "../api/use-enriched-planet-data"
import { usePlanetLeaderboard } from "../hooks/use-planet-leaderboard"
import { usePlanetSearch } from "../hooks/use-planet-search"
import { usePlanetStore } from "../stores/planet-store"

import { LeaderboardMobileDialog } from "./leaderboard-mobile-dialog"
import { LeaderboardPanel } from "./leaderboard-panel"
import { PlanetSearchPanel } from "./planet-search-panel"

type Mode = "closed" | "leaderboard" | "search"

export function PlanetLeaderboard() {
  const router = useRouter()
  const leaderboard = usePlanetLeaderboard()
  const { data: snapshot } = useEnrichedPlanetData()
  const [mode, setMode] = useState<Mode>("closed")
  const setFocusIslandId = usePlanetStore((s) => s.setFocusIslandId)
  const isMobile = useMediaQuery(mediaQuery.max(BREAKPOINTS.hudMobile))
  const wasMobileRef = useRef(isMobile)
  const search = usePlanetSearch(
    snapshot?.territories ?? [],
    snapshot?.islands ?? [],
  )

  useEffect(() => {
    if (wasMobileRef.current && !isMobile && mode !== "closed") {
      setMode("closed")
    }
    wasMobileRef.current = isMobile
  }, [isMobile, mode])

  if (!leaderboard) return null

  const { topAll, myGlobalRank, byIsland } = leaderboard

  const viewDeveloper = (login: string) => {
    setMode("closed")
    router.push(`/u/${encodeURIComponent(login)}`)
  }

  const handleAccordionChange = (value: string[]) => {
    const islandId = value.find((v) => v !== "top-10")
    setFocusIslandId(islandId ?? null)
  }

  const handleLeaderboardClick = () => {
    if (isMobile) {
      setMode("leaderboard")
      return
    }
    setMode((m) => (m === "leaderboard" ? "closed" : "leaderboard"))
  }

  const handleSearchClick = () => {
    if (mode !== "search") search.setQuery("")
    setMode((m) => (m === "search" ? "closed" : "search"))
  }

  const leaderboardOpen = mode === "leaderboard"
  const searchOpen = mode === "search"

  return (
    <>
      <HudRightDock>
        <div className="flex h-10 items-center">
          <button
            onClick={handleSearchClick}
            aria-label="Search players"
            aria-expanded={searchOpen}
            className={cn(
              "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border-r border-white/[0.06] transition-colors",
              searchOpen ? "text-zinc-200" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <Search size={12} />
          </button>

          <button
            onClick={handleLeaderboardClick}
            aria-label="Leaderboard"
            aria-expanded={leaderboardOpen}
            className={cn(
              "flex h-10 flex-1 cursor-pointer items-center gap-2 px-3 text-left",
              "max-hud-mobile:w-10 max-hud-mobile:flex-none max-hud-mobile:justify-center max-hud-mobile:gap-0 max-hud-mobile:px-0",
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
                !leaderboardOpen && "-rotate-90",
              )}
            />
          </button>
        </div>

        {searchOpen && (
          <PlanetSearchPanel
            query={search.query}
            setQuery={search.setQuery}
            results={search.results}
            onSelect={viewDeveloper}
            onClose={() => setMode("closed")}
          />
        )}

        {leaderboardOpen && !isMobile && (
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
        open={leaderboardOpen && isMobile}
        onOpenChange={(v) => setMode(v ? "leaderboard" : "closed")}
        topAll={topAll}
        myGlobalRank={myGlobalRank}
        byIsland={byIsland}
        onViewDeveloper={viewDeveloper}
        onAccordionChange={handleAccordionChange}
      />
    </>
  )
}
