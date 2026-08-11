import type { ReactNode } from "react"

export function HudFrame({ children }: { children: ReactNode }) {
  return (
    <div
      data-hud-frame
      className="fixed inset-0 flex bg-hud-outer-bg pl-1 pr-4 pt-4 pb-4"
    >
      <div className="hud-shell">
        <div className="hud-border">
          <div className="hud-inner">{children}</div>
        </div>
      </div>
    </div>
  )
}
