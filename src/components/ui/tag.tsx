import type { ReactNode } from "react"
import { MapPin } from "lucide-react"

import { cn } from "@/lib/utils"

type Variant = "default" | "warning"

type Props = {
  label: string
  icon?: ReactNode
  variant?: Variant
  className?: string
}

/**
 * Compact HUD tag — optional leading icon (MapPin by default).
 */
export function Tag({ label, icon, variant = "default", className }: Props) {
  return (
    <div
      className={cn(
        "flex w-fit items-center gap-1.5 border px-2.5 py-1.5 backdrop-blur-sm",
        variant === "default" && "border-white/[0.08] bg-black/40",
        variant === "warning" && "border-amber-500/30 bg-amber-500/10",
        className,
      )}
    >
      {icon === undefined ? (
        <MapPin
          size={10}
          className={cn(
            "shrink-0",
            variant === "default" && "text-foreground/40",
            variant === "warning" && "text-amber-400/70",
          )}
          strokeWidth={1.5}
        />
      ) : (
        icon
      )}
      <span
        className={cn(
          "ticker text-[10px] uppercase tracking-[0.26em]",
          variant === "default" && "text-foreground/55",
          variant === "warning" && "text-amber-400/90",
        )}
      >
        {label}
      </span>
    </div>
  )
}
