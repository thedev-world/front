import { useSyncExternalStore } from "react"

function subscribe(query: string, onStoreChange: () => void) {
  const mq = window.matchMedia(query)
  mq.addEventListener("change", onStoreChange)
  return () => mq.removeEventListener("change", onStoreChange)
}

function getServerSnapshot() {
  return false
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => window.matchMedia(query).matches,
    getServerSnapshot,
  )
}
