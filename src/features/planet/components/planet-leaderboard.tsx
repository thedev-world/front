"use client"

import { ChevronDown, Trophy } from "lucide-react"
import { useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { usePlanetLeaderboard } from "../hooks/use-planet-leaderboard"
import type { LeaderboardEntry } from "../hooks/use-planet-leaderboard"
import { usePlanetStore } from "../stores/planet-store"

function rankColor(rank: number): string {
  if (rank === 1) return "text-amber-400"
  if (rank === 2) return "text-slate-300"
  if (rank === 3) return "text-orange-400"
  return "text-zinc-600"
}

function LeaderboardRow({
  entry,
  showIsland = true,
  onClick,
}: {
  entry: LeaderboardEntry
  showIsland?: boolean
  onClick?: () => void
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(
        "flex items-center gap-1.5 rounded px-1.5 py-1 transition-colors",
        entry.isMe && "bg-white/[0.06] ring-1 ring-inset ring-white/15",
        onClick && "cursor-pointer hover:bg-white/[0.04]",
      )}
    >
      <span
        className={cn(
          "shrink-0 text-[10px] tabular-nums",
          rankColor(entry.rank),
        )}
      >
        #{entry.rank}
      </span>

      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[11px]",
          entry.isMe ? "font-semibold text-white" : "text-zinc-400",
        )}
      >
        @{entry.login}
      </span>

      {showIsland && entry.island && (
        <span className="shrink-0 text-[10px] text-zinc-600">
          {entry.island.id}
        </span>
      )}

      <span className="shrink-0 text-[10px] tabular-nums text-zinc-600">
        {entry.cellCount}
      </span>
    </div>
  )
}

export function PlanetLeaderboard() {
  const leaderboard = usePlanetLeaderboard()
  const [collapsed, setCollapsed] = useState(true)
  const { setFocusIslandId, setFocusLogin } = usePlanetStore()

  if (!leaderboard) return null

  const { topAll, myGlobalRank, byIsland } = leaderboard

  const handleAccordionChange = (value: string[]) => {
    // Focus the island if a per-island item was just opened
    const islandId = value.find((v) => v !== "top-10")
    setFocusIslandId(islandId ?? null)
  }

  return (
    <div className="absolute right-4 top-4 z-40 w-52 border border-white/20 bg-black/40 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <Trophy size={12} className="shrink-0 text-amber-400" />
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-300">
          Leaderboard
        </span>
        <ChevronDown
          size={13}
          className={cn(
            "shrink-0 text-zinc-500 transition-transform duration-200",
            collapsed && "-rotate-90",
          )}
        />
      </button>

      {/* Content */}
      {!collapsed && (
        <div className="border-t border-white/[0.06]">
          <Accordion
            defaultValue={["top-10"]}
            className="flex flex-col"
            onValueChange={handleAccordionChange}
          >
            {/* Top 10 all islands — open by default */}
            <AccordionItem value="top-10" className="border-b border-white/[0.06]">
              <AccordionTrigger className="px-3 py-1.5 hover:no-underline">
                <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                  All Islands - Top 10
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-2">
                <div className="flex flex-col gap-0.5">
                  {topAll.map((entry) => (
                    <LeaderboardRow
                      key={entry.login}
                      entry={entry}
                      showIsland={false}
                      onClick={() => setFocusLogin(entry.login)}
                    />
                  ))}
                  {myGlobalRank && (
                    <>
                      <div className="my-0.5 border-t border-white/[0.06]" />
                      <LeaderboardRow
                        entry={myGlobalRank}
                        showIsland={false}
                        onClick={() => setFocusLogin(myGlobalRank.login)}
                      />
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Per-island accordion items */}
            {byIsland.map(({ island, entries, myIslandRank }) => (
              <AccordionItem
                key={island.id}
                value={island.id}
                className="border-b border-white/[0.04] last:border-0"
              >
                <AccordionTrigger className="px-3 py-1.5 hover:no-underline">
                  <span className="text-[11px] text-zinc-400">
                    {island.name} island
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-2">
                  <div className="flex flex-col gap-0.5">
                    {entries.map((entry) => (
                      <LeaderboardRow
                        key={entry.login}
                        entry={entry}
                        showIsland={false}
                        onClick={() => setFocusLogin(entry.login)}
                      />
                    ))}
                    {myIslandRank && (
                      <>
                        <div className="my-0.5 border-t border-white/[0.06]" />
                        <LeaderboardRow
                          entry={myIslandRank}
                          showIsland={false}
                          onClick={() => setFocusLogin(myIslandRank.login)}
                        />
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  )
}
