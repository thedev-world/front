"use client"

import { Dialog } from "@base-ui/react/dialog"
import { Trophy, X } from "lucide-react"

import { HudReadoutShell } from "@/components/ui/hud-panel"
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
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup
          className="fixed inset-x-4 top-14 z-50 outline-none"
          aria-label="Leaderboard"
        >
          <HudReadoutShell>
            <div className="flex h-10 items-center gap-2 border-b border-white/[0.06] px-3">
              <Trophy size={12} className="shrink-0 text-amber-400" />
              <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-300">
                Leaderboard
              </span>
              <Dialog.Close
                aria-label="Close leaderboard"
                className="flex size-8 cursor-pointer items-center justify-center text-zinc-500 transition-colors hover:text-zinc-300"
              >
                <X size={14} />
              </Dialog.Close>
            </div>

            <ScrollArea className="max-h-[min(60vh,28rem)] border-t border-white/[0.06]">
              <LeaderboardPanel
                topAll={topAll}
                myGlobalRank={myGlobalRank}
                byIsland={byIsland}
                onViewDeveloper={onViewDeveloper}
                onAccordionChange={onAccordionChange}
              />
            </ScrollArea>
          </HudReadoutShell>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
