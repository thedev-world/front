const KEY = "world-interaction-hint-dismissed"

export function isWorldInteractionHintDismissed(): boolean {
  if (typeof sessionStorage === "undefined") return false
  return sessionStorage.getItem(KEY) === "true"
}

export function dismissWorldInteractionHint(): void {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.setItem(KEY, "true")
}
