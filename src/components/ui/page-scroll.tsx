"use client"

import type { ReactNode } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type Props = {
  children: ReactNode
  className?: string
}

/** Styled page scroll — HUD thumb via ScrollArea. */
export function PageScroll({ children, className }: Props) {
  return (
    <ScrollArea className={cn("relative min-h-0 flex-1", className)}>
      {children}
    </ScrollArea>
  )
}
