"use client"

import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type Props = {
  onClick?: () => void
  children?: ReactNode
  className?: string
}

/**
 * Text back control used as a panel header strip
 */
export function BackButton({
  onClick,
  children = "Back",
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex shrink-0 cursor-pointer items-center gap-2 border-b border-white/[0.06] px-5 py-3 text-left",
        className,
      )}
    >
      <ArrowLeft
        size={14}
        className="text-zinc-400 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-hi"
      />
      <span className="ticker text-[10px] uppercase tracking-[0.24em] text-zinc-400 transition-colors group-hover:text-white">
        {children}
      </span>
    </button>
  )
}
