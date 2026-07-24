import type { ReactNode } from "react"
import { MapPin } from "lucide-react"

import { cn } from "@/lib/utils"

type Props = {
  label: string
  icon?: ReactNode
  className?: string
}

/**
 * Compact HUD tag — optional leading icon (MapPin by default).
 */
export function Tag({ label, icon, className }: Props) {
  return (
    <div
      className={cn(
        "flex w-fit items-center gap-1.5 border border-white/[0.08] bg-black/40 px-2.5 py-1.5 backdrop-blur-sm",
        className,
      )}
    >
      {icon === undefined ? (
        <MapPin size={10} className="shrink-0 text-foreground/40" strokeWidth={1.5} />
      ) : (
        icon
      )}
      <span className="ticker text-[10px] uppercase tracking-[0.26em] text-foreground/55">
        {label}
      </span>
    </div>
  )
}
