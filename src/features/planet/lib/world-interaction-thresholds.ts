export const POINTER_MOVE_THRESHOLD_PX = 10
export const WHEEL_DELTA_THRESHOLD = 10
export const PINCH_DISTANCE_THRESHOLD_PX = 12

export function exceedsPointerThreshold(dx: number, dy: number): boolean {
  return Math.hypot(dx, dy) > POINTER_MOVE_THRESHOLD_PX
}

export function exceedsWheelThreshold(deltaY: number): boolean {
  return Math.abs(deltaY) > WHEEL_DELTA_THRESHOLD
}

export function exceedsPinchThreshold(
  startDistance: number,
  currentDistance: number,
): boolean {
  return Math.abs(currentDistance - startDistance) > PINCH_DISTANCE_THRESHOLD_PX
}

export function getTouchDistance(touches: TouchList): number | null {
  if (touches.length < 2) return null
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.hypot(dx, dy)
}
