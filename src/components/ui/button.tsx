import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority"

import { HudReadoutShell } from "@/components/ui/hud-panel"
import { cn } from "@/lib/utils"

const buttonControlBase =
  "group/button hud-readout-button-control relative overflow-hidden cursor-pointer items-center justify-center rounded-sm border-0 font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-hi/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

const buttonLayoutClasses = {
  inline: "inline-flex shrink-0",
  block: "flex w-full",
} as const

const buttonSizeClasses = {
  primary: {
    sm: "btn-hud-primary gap-2 px-4 py-2 text-[13px]",
    md: "btn-hud-primary gap-2.5 px-5 py-2.5 text-sm",
    lg: "btn-hud-primary gap-2.5 px-6 py-3 text-sm tracking-wide",
  },
  secondary: {
    sm: "btn-hud-secondary gap-1.5 px-3 py-1.5 text-xs",
    md: "btn-hud-secondary gap-2 px-4 py-2 text-[13px]",
    lg: "btn-hud-secondary gap-2 px-5 py-2.5 text-sm",
  },
  destructive: {
    sm: "btn-hud-destructive gap-1.5 px-3 py-1.5 text-xs",
    md: "btn-hud-destructive gap-2 px-4 py-2 text-[13px]",
    lg: "btn-hud-destructive gap-2 px-5 py-2.5 text-sm",
  },
  toggle: {
    sm: "gap-1.5 px-3 py-1.5 text-xs",
    md: "gap-2 px-4 py-2 text-[13px]",
    lg: "gap-2 px-5 py-2.5 text-sm",
  },
} as const

const shellVariants = cva("hud-readout-button", {
  variants: {
    shell: {
      primary: "hud-readout-button--primary",
      secondary: "hud-readout-button--secondary",
      "toggle-selected": "hud-readout-button--toggle-selected",
    },
  },
  defaultVariants: {
    shell: "primary",
  },
})

type ButtonVariant = keyof typeof buttonSizeClasses
type ButtonSize = keyof typeof buttonSizeClasses.primary

type ButtonProps = ButtonPrimitive.Props & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretch button + HUD shell to the container width. */
  fullWidth?: boolean
  /** Selection state — only for `variant="toggle"`. */
  selected?: boolean
  /** Muted label — `secondary` and unselected `toggle`. */
  muted?: boolean
  shellClassName?: string
}

function resolveShell(
  variant: ButtonVariant,
  selected: boolean,
): "primary" | "secondary" | "toggle-selected" {
  if (variant === "toggle") {
    return selected ? "toggle-selected" : "secondary"
  }
  if (variant === "destructive") return "secondary"
  return variant
}

function resolveControlClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  selected: boolean,
  muted: boolean,
) {
  if (variant === "toggle") {
    return cn(
      buttonSizeClasses.toggle[size],
      selected ? "btn-hud-toggle-selected" : "btn-hud-secondary",
      !selected && muted && "text-muted-foreground",
    )
  }

  return cn(
    buttonSizeClasses[variant][size],
    muted && variant === "secondary" && "text-muted-foreground",
  )
}

function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  selected = false,
  muted = false,
  shellClassName,
  className,
  children,
  ...props
}: ButtonProps) {
  const shell = resolveShell(variant, selected)
  const layout = fullWidth ? buttonLayoutClasses.block : buttonLayoutClasses.inline

  return (
    <HudReadoutShell
      className={cn(
        shellVariants({ shell }),
        layout,
        fullWidth && "[&_.hud-readout-panel-border]:w-full",
        shellClassName,
      )}
      innerClassName={fullWidth ? "w-full" : undefined}
    >
      <ButtonPrimitive
        data-slot="button"
        aria-pressed={variant === "toggle" ? selected : undefined}
        className={cn(
          buttonControlBase,
          layout,
          resolveControlClasses(variant, size, selected, muted),
          className,
        )}
        {...props}
      >
        {variant === "primary" && (
          <span aria-hidden className="btn-hud-sweep" />
        )}
        {children}
      </ButtonPrimitive>
    </HudReadoutShell>
  )
}

/** @deprecated Use Button props directly — kept for shadcn-style consumers. */
const buttonVariants = cva(buttonControlBase, {
  variants: {
    variant: {
      primary: "btn-hud-primary",
      secondary: "btn-hud-secondary",
      destructive: "btn-hud-destructive",
      toggle: "btn-hud-secondary",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})

export { Button, buttonVariants }
export type { ButtonProps, ButtonVariant, ButtonSize }
