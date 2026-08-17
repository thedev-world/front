import type { HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative flex w-full gap-3 border px-4 py-3 text-sm [&>svg]:mt-0.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-white/[0.08] bg-white/[0.02] text-foreground",
        warning:
          "border-amber-500/25 bg-amber-500/[0.07] text-amber-200 [&>svg]:text-amber-400",
        destructive:
          "border-red-500/25 bg-red-500/[0.07] text-red-200 [&>svg]:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

type AlertProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn(
        "ticker mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] leading-none",
        className,
      )}
      {...props}
    >
      {children}
    </h5>
  )
}

function AlertContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 flex-1", className)} {...props} />
}

function AlertDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[12px] leading-relaxed opacity-80", className)}
      {...props}
    />
  )
}

export { Alert, AlertContent, AlertTitle, AlertDescription }
