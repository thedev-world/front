import { dismissWorldInteractionHint, isWorldInteractionHintDismissed } from "./world-interaction-hint-storage"
import {
  exceedsPinchThreshold,
  exceedsPointerThreshold,
  exceedsWheelThreshold,
  getTouchDistance,
} from "./world-interaction-thresholds"

type Point = { x: number; y: number }

export function attachWorldInteractionDetection(
  domElement: HTMLElement,
  onExplorationStarted: () => void,
): () => void {
  if (isWorldInteractionHintDismissed()) return () => {}

  let pointerDown: Point | null = null
  let touchStart: Point | null = null
  let pinchStartDistance: number | null = null
  let dismissed = false

  const dismiss = () => {
    if (dismissed) return
    dismissed = true
    dismissWorldInteractionHint()
    onExplorationStarted()
  }

  const onPointerDown = (e: PointerEvent) => {
    if (dismissed || e.button !== 0) return
    pointerDown = { x: e.clientX, y: e.clientY }
  }

  const onPointerMove = (e: PointerEvent) => {
    if (dismissed || !pointerDown) return
    const dx = e.clientX - pointerDown.x
    const dy = e.clientY - pointerDown.y
    if (exceedsPointerThreshold(dx, dy)) dismiss()
  }

  const onPointerUp = () => {
    pointerDown = null
  }

  const onWheel = (e: WheelEvent) => {
    if (dismissed) return
    if (exceedsWheelThreshold(e.deltaY)) dismiss()
  }

  const onTouchStart = (e: TouchEvent) => {
    if (dismissed) return
    if (e.touches.length === 1) {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      pinchStartDistance = null
    } else if (e.touches.length >= 2) {
      touchStart = null
      pinchStartDistance = getTouchDistance(e.touches)
    }
  }

  const onTouchMove = (e: TouchEvent) => {
    if (dismissed) return
    if (e.touches.length === 1 && touchStart) {
      const dx = e.touches[0].clientX - touchStart.x
      const dy = e.touches[0].clientY - touchStart.y
      if (exceedsPointerThreshold(dx, dy)) dismiss()
    } else if (e.touches.length >= 2 && pinchStartDistance !== null) {
      const current = getTouchDistance(e.touches)
      if (current !== null && exceedsPinchThreshold(pinchStartDistance, current)) {
        dismiss()
      }
    }
  }

  const onTouchEnd = () => {
    touchStart = null
    pinchStartDistance = null
  }

  domElement.addEventListener("pointerdown", onPointerDown)
  domElement.addEventListener("pointermove", onPointerMove)
  domElement.addEventListener("pointerup", onPointerUp)
  domElement.addEventListener("pointercancel", onPointerUp)
  domElement.addEventListener("wheel", onWheel, { passive: true })
  domElement.addEventListener("touchstart", onTouchStart, { passive: true })
  domElement.addEventListener("touchmove", onTouchMove, { passive: true })
  domElement.addEventListener("touchend", onTouchEnd)
  domElement.addEventListener("touchcancel", onTouchEnd)

  return () => {
    domElement.removeEventListener("pointerdown", onPointerDown)
    domElement.removeEventListener("pointermove", onPointerMove)
    domElement.removeEventListener("pointerup", onPointerUp)
    domElement.removeEventListener("pointercancel", onPointerUp)
    domElement.removeEventListener("wheel", onWheel)
    domElement.removeEventListener("touchstart", onTouchStart)
    domElement.removeEventListener("touchmove", onTouchMove)
    domElement.removeEventListener("touchend", onTouchEnd)
    domElement.removeEventListener("touchcancel", onTouchEnd)
  }
}
