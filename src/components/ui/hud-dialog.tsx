"use client"

import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import type { ReactNode } from "react"

import { HudReadoutShell } from "@/components/ui/hud-panel"
import { cn } from "@/lib/utils"

export type HudDialogSize = "default" | "sm" | "md" | "lg" | "xl"

const popupBase = "fixed top-14 z-50 outline-none"

function centeredPopup(maxWidth: string) {
  return cn("left-1/2 w-[calc(100%-2rem)] -translate-x-1/2", maxWidth)
}

const popupWidthClasses: Record<HudDialogSize, string> = {
  default: "inset-x-4",
  sm: centeredPopup("max-w-sm"),
  md: centeredPopup("max-w-md"),
  lg: centeredPopup("max-w-lg"),
  xl: centeredPopup("max-w-xl"),
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  ariaLabel: string
  closeLabel?: string
  icon?: ReactNode
  children: ReactNode
  size?: HudDialogSize
  className?: string
}

export function HudDialog({
  open,
  onOpenChange,
  title,
  ariaLabel,
  closeLabel = "Close dialog",
  icon,
  children,
  size = "default",
  className,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup
          className={cn(popupBase, popupWidthClasses[size], className)}
          aria-label={ariaLabel}
        >
          <HudReadoutShell>
            <div className="flex h-10 items-center gap-2 border-b border-white/[0.06] px-3">
              {icon}
              <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-300">
                {title}
              </span>
              <Dialog.Close
                aria-label={closeLabel}
                className="flex size-8 cursor-pointer items-center justify-center text-zinc-500 transition-colors hover:text-zinc-300"
              >
                <X size={14} />
              </Dialog.Close>
            </div>

            {children}
          </HudReadoutShell>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
