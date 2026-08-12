"use client"

import { Trophy } from "lucide-react"

import { HudDialog } from "@/components/ui/hud-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

import type {
  IslandLeaderboard,
  LeaderboardEntry,
} from "../hooks/use-planet-leaderboard"

import { LeaderboardPanel } from "./leaderboard-panel"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  topAll: LeaderboardEntry[]
  myGlobalRank: LeaderboardEntry | null
  byIsland: IslandLeaderboard[]
  onViewDeveloper: (login: string) => void
  onAccordionChange: (value: string[]) => void
}

export function LeaderboardMobileDialog({
  open,
  onOpenChange,
  topAll,
  myGlobalRank,
  byIsland,
  onViewDeveloper,
  onAccordionChange,
}: Props) {
  return (
    <HudDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Leaderboard"
      ariaLabel="Leaderboard"
      closeLabel="Close leaderboard"
      icon={<Trophy size={12} className="shrink-0 text-amber-400" />}
    >
      <ScrollArea className="max-h-[min(60vh,28rem)] border-t border-white/[0.06]">
        <LeaderboardPanel
          topAll={topAll}
          myGlobalRank={myGlobalRank}
          byIsland={byIsland}
          onViewDeveloper={onViewDeveloper}
          onAccordionChange={onAccordionChange}
        />
      </ScrollArea>
    </HudDialog>
  )
}
