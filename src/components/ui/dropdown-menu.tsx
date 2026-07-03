"use client"

import { Menu } from "@base-ui/react/menu"
import { cn } from "@/lib/utils"
import { HudReadoutShell } from "@/components/ui/hud-panel"

function DropdownMenu(props: Menu.Root.Props) {
  return <Menu.Root {...props} />
}

function DropdownMenuTrigger(props: Menu.Trigger.Props) {
  return <Menu.Trigger className="group inline-flex cursor-pointer" data-slot="dropdown-trigger" {...props} />
}

function DropdownMenuContent({
  className,
  sideOffset = 6,
  side = "bottom",
  align = "start",
  hud = true,
  matchAnchorWidth = false,
  children,
  ...positionerProps
}: Menu.Positioner.Props & {
  className?: string
  children?: React.ReactNode
  hud?: boolean
  matchAnchorWidth?: boolean
}) {
  const popupClassName = cn(
    "z-50 overflow-hidden p-1 text-sm outline-none",
    "data-starting-style:opacity-0 data-starting-style:-translate-y-1",
    "data-ending-style:opacity-0 data-ending-style:-translate-y-1",
    "transition-[opacity,transform] duration-150 ease-out",
    hud
      ? "hud-readout-button-control min-w-0 w-full rounded-none border-0 bg-transparent shadow-none"
      : cn(
          "glass-panel min-w-[11rem] rounded-md",
          matchAnchorWidth &&
            "w-[length:var(--anchor-width)] min-w-[length:var(--anchor-width)]",
        ),
    !hud && className,
  )

  const popup = (
    <Menu.Popup className={popupClassName}>{children}</Menu.Popup>
  )

  return (
    <Menu.Portal>
      <Menu.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          matchAnchorWidth &&
            "w-[length:var(--anchor-width)] min-w-[length:var(--anchor-width)]",
        )}
        {...positionerProps}
      >
        {hud ? (
          <HudReadoutShell
            className={cn("hud-readout-button w-full", className)}
          >
            {popup}
          </HudReadoutShell>
        ) : (
          popup
        )}
      </Menu.Positioner>
    </Menu.Portal>
  )
}

function DropdownMenuItem({
  className,
  ...props
}: Menu.Item.Props) {
  return (
    <Menu.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 px-2.5 py-1.5",
        "text-xs font-medium text-zinc-300 outline-none transition-colors",
        "data-highlighted:bg-white/[0.06]",
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuDestructiveItem({
  className,
  ...props
}: Menu.Item.Props) {
  return (
    <Menu.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 px-2.5 py-1.5",
        "text-[12px] font-medium text-destructive outline-none transition-colors",
        "data-highlighted:bg-destructive/10",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div role="separator" className={cn("my-1 h-px bg-white/10", className)} />
}

function DropdownMenuLabel({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500", className)}>
      {children}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuDestructiveItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
}
