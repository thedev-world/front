import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DashboardPageHeaderProps = {
  children: ReactNode
  className?: string
}

/** Sticky top bar */
export function DashboardPageHeader({ children, className }: DashboardPageHeaderProps) {
  return (
    <div
      className={cn(
        "shrink-0 border-b border-white/10 bg-[#010409]/80 px-4 py-6 backdrop-blur-sm sm:px-6",
        className,
      )}
    >
      {children}
    </div>
  )
}
