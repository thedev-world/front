import type { ReactNode } from "react"

import { CosmicBackdrop } from "@/features/profile/components/cosmic-backdrop"
import { cn } from "@/lib/utils"

type Props = {
  children: ReactNode
  className?: string
  hexGridOpacity?: "0.05" | "0.08"
}

/** Shared shell for authenticated dashboard routes */
export function DashboardPageShell({
  children,
  className,
  hexGridOpacity = "0.05",
}: Props) {
  return (
    <main
      className={cn("relative flex min-h-svh w-full flex-col", className)}
    >
      <CosmicBackdrop />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 hex-grid-corner",
          hexGridOpacity === "0.05" ? "opacity-[0.05]" : "opacity-[0.08]",
        )}
      />
      {children}
    </main>
  )
}
