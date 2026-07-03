import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

type ShellProps = ComponentProps<"div"> & {
  children: ReactNode
  innerClassName?: string
}

/** Shared readout chrome — light chamfer border + violet panel fill. */
export function HudReadoutShell({
  children,
  className,
  innerClassName,
  ...props
}: ShellProps) {
  return (
    <div className={cn(className)} {...props}>
      <div className="hud-readout-panel-border">
        <div className={cn("hud-readout-panel-inner", innerClassName)}>{children}</div>
      </div>
    </div>
  )
}

/** Top-center dock — chamfered panel merged into the frame notch. */
export function HudTopDock({
  children,
  className,
  innerClassName,
  ...props
}: ShellProps) {
  return (
    <div className={cn("hud-top-dock", className)} {...props}>
      <div className="hud-top-dock-border">
        <div className={cn("hud-top-dock-inner", innerClassName)}>{children}</div>
      </div>
    </div>
  )
}

/** Floating readout — inset from the frame, light chamfered corners. */
export function HudRightDock({
  children,
  className,
  innerClassName,
  ...props
}: ShellProps) {
  return (
    <div className={cn("hud-right-dock", className)} {...props}>
      <HudReadoutShell innerClassName={innerClassName}>{children}</HudReadoutShell>
    </div>
  )
}

/** Bottom-left dock — merged into the frame corner, open bottom + left. */
export function HudBottomLeftDock({
  children,
  className,
  innerClassName,
  ...props
}: ShellProps) {
  return (
    <div className={cn("hud-bottom-left-dock", className)} {...props}>
      <div className="hud-bottom-left-dock-border">
        <div className={cn("hud-bottom-left-dock-inner", innerClassName)}>
          {children}
        </div>
      </div>
    </div>
  )
}
