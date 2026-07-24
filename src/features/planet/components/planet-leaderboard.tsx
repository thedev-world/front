"use client"

import { ChevronDown, Hexagon, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HudRightDock } from "@/components/ui/hud-panel"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  const className = cn(
    "flex w-full items-center gap-1.5 border-0 bg-transparent px-1.5 py-1 text-left font-inherit transition-colors",
    entry.isMe && "bg-white/[0.06] ring-1 ring-inset ring-white/15",
    onClick && "cursor-pointer hover:bg-white/[0.04]",
  )

  const content = (
    <>
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
        @{entry.githubLogin}
      </span>

      {showIsland && entry.island && (
        <span className="shrink-0 text-[10px] text-zinc-600">
          {entry.island.id}
        </span>
      )}

      <div className="flex shrink-0 items-center gap-0.5 text-[10px] tabular-nums text-hi/60">
        {entry.cellCount}
        <Hexagon size={10} />
      </div>
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    )
  }

  return <div className={className}>{content}</div>
}

export function PlanetLeaderboard() {
  const router = useRouter()
  const leaderboard = usePlanetLeaderboard()
  const [collapsed, setCollapsed] = useState(true)
  const setFocusIslandId = usePlanetStore((s) => s.setFocusIslandId)

  if (!leaderboard) return null

  const { topAll, myGlobalRank, byIsland } = leaderboard

  const viewDeveloper = (login: string) => {
    router.push(`/u/${encodeURIComponent(login)}`)
  }

  const handleAccordionChange = (value: string[]) => {
    // Focus the island if a per-island item was just opened
    const islandId = value.find((v) => v !== "top-10")
    setFocusIslandId(islandId ?? null)
  }

  return (
    <HudRightDock>
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-2 px-3 text-left h-10 cursor-pointer"
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

      {!collapsed && (
        <ScrollArea className="max-h-[min(60vh,28rem)] border-t border-white/[0.06]">
          <Accordion
            defaultValue={["top-10"]}
            className="flex flex-col"
            onValueChange={handleAccordionChange}
          >
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
                      key={entry.githubLogin}
                      entry={entry}
                      showIsland={false}
                      onClick={() => viewDeveloper(entry.githubLogin)}
                    />
                  ))}
                  {myGlobalRank && (
                    <>
                      <div className="my-0.5 border-t border-white/[0.06]" />
                      <LeaderboardRow
                        entry={myGlobalRank}
                        showIsland={false}
                        onClick={() => viewDeveloper(myGlobalRank.githubLogin)}
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
                        key={entry.githubLogin}
                        entry={entry}
                        showIsland={false}
                        onClick={() => viewDeveloper(entry.githubLogin)}
                      />
                    ))}
                    {myIslandRank && (
                      <>
                        <div className="my-0.5 border-t border-white/[0.06]" />
                        <LeaderboardRow
                          entry={myIslandRank}
                          showIsland={false}
                          onClick={() => viewDeveloper(myIslandRank.githubLogin)}
                        />
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      )}
    </HudRightDock>
  )
}
