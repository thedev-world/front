"use client"

import { Hexagon, X } from "lucide-react"
import { type KeyboardEvent, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

import type { LeaderboardEntry } from "../hooks/use-planet-leaderboard"

type Props = {
  query: string
  setQuery: (q: string) => void
  results: LeaderboardEntry[]
  onSelect: (login: string) => void
  onClose: () => void
}

export function PlanetSearchPanel({
  query,
  setQuery,
  results,
  onSelect,
  onClose,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }

  return (
    <div className="flex flex-col border-t border-white/[0.06]">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search developer..."
          className="min-w-0 flex-1 bg-transparent text-[11px] text-zinc-300 outline-none placeholder:text-zinc-600"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="cursor-pointer shrink-0 text-zinc-600 transition-colors hover:text-zinc-400"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {query.trim() && (
        <div className="flex flex-col border-t border-white/[0.04] pb-1">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-[10px] text-zinc-600">No results</p>
          ) : (
            results.map((entry) => (
              <SearchRow
                key={entry.githubLogin}
                entry={entry}
                onClick={() => onSelect(entry.githubLogin)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function SearchRow({
  entry,
  onClick,
}: {
  entry: LeaderboardEntry
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-1.5 border-0 bg-transparent px-1.5 py-1 text-left transition-colors hover:bg-white/[0.04]",
        entry.isMe && "bg-white/[0.06] ring-1 ring-inset ring-white/15",
      )}
    >
      <span className="shrink-0 text-[10px] tabular-nums text-zinc-600">
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
      {entry.island && (
        <span className="shrink-0 text-[10px] text-zinc-600">
          {entry.island.id}
        </span>
      )}
      <div className="flex shrink-0 items-center gap-0.5 text-[10px] tabular-nums text-hi/60">
        {entry.cellCount}
        <Hexagon size={10} />
      </div>
    </button>
  )
}
