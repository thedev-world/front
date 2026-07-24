"use client"

import { ExternalLink as ExternalLinkIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type Props = {
  href: string
  children: ReactNode
  className?: string
  title?: string
}

/**
 * Outbound text link with an external-link affordance (new tab).
 */
export function ExternalLink({ href, children, className, title }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className={cn(
        "group/ext inline-flex min-w-0 max-w-full items-center gap-1.5 text-white transition-colors hover:text-hi",
        className,
      )}
    >
      <span className="ticker truncate text-sm font-medium">{children}</span>
      <ExternalLinkIcon
        size={12}
        aria-hidden
        className="shrink-0 text-zinc-500 transition-colors group-hover/ext:text-hi"
      />
    </a>
  )
}
