"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Check } from "lucide-react"
import type { ReactNode } from "react"
import { useId } from "react"

import { HudReadoutShell } from "@/components/ui/hud-panel"
import { cn } from "@/lib/utils"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[3px] border transition-all outline-none",
        "border-white/25 bg-white/10",
        "focus-visible:border-hi/40 focus-visible:ring-3 focus-visible:ring-hi/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-checked:border-hi/40 data-checked:bg-primary data-checked:text-primary-foreground",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3"
      >
        <Check strokeWidth={3} aria-hidden />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

type CheckboxFieldProps = {
  id?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: CheckboxPrimitive.Root.Props["onCheckedChange"]
  disabled?: boolean
  title: ReactNode
  description?: ReactNode
  className?: string
  innerClassName?: string
}

function CheckboxField({
  id,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  title,
  description,
  className,
  innerClassName,
}: CheckboxFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <HudReadoutShell
      className={cn(
        "transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
        className,
      )}
      innerClassName={cn("p-4", innerClassName)}
    >
      <label
        htmlFor={fieldId}
        className={cn(
          "flex cursor-pointer items-start gap-3 text-left",
          disabled && "cursor-not-allowed",
        )}
      >
        <Checkbox
          id={fieldId}
          nativeButton
          render={<button type="button" disabled={disabled} />}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className="mt-0.5"
        />
        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-200">{title}</span>
          {description ? (
            <span className="text-sm leading-relaxed text-zinc-400">{description}</span>
          ) : null}
        </span>
      </label>
    </HudReadoutShell>
  )
}

export { Checkbox, CheckboxField }
