"use client"

import type { ReactNode } from "react"

import { formatCompactNumber } from "@/features/profile/lib/format"
import { useCountUp } from "@/features/profile/lib/use-count-up"
import { cn } from "@/lib/utils"

type Props = {
  icon: ReactNode
  label: string
  /** Numbers are compact-formatted; strings render as-is (e.g. `#3`). */
  value: number | string
  /** Optional trailing fragment, e.g. `/ 42`. */
  suffix?: string
  /** Count-up animation when `value` is a number. */
  animate?: boolean
  delay?: number
  className?: string
}

/**
 * Compact HUD metric tile — shared by profile dossier and planet profile card.
 */
export function StatItem({
  icon,
  label,
  value,
  suffix,
  animate = false,
  delay = 0,
  className,
}: Props) {
  const numeric = typeof value === "number"
  const animated = useCountUp(numeric ? value : 0, {
    duration: 1500,
    delay: 200 + delay,
    enabled: animate && numeric,
  })

  const display = numeric
    ? formatCompactNumber(Math.round(animate ? animated : value))
    : value

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border border-white/[0.05] bg-white/[0.01] p-4 transition-colors duration-300 hover:border-white/[0.09]",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span className="[&_svg]:size-3">{icon}</span>
        <span className="ticker text-[10px] uppercase tracking-[0.24em]">{label}</span>
      </div>
      <span className="ticker ticker-tabular text-[1.6rem] font-semibold leading-none text-foreground/80">
        {display}
        {suffix ? (
          <span className="ml-1 text-sm font-normal text-muted-foreground/60">
            {suffix}
          </span>
        ) : null}
      </span>
    </div>
  )
}
