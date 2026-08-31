const KEY = "thedevworld_has_connected"
const CHANGE_EVENT = "thedevworld_has_connected_change"

function readFlag(): boolean {
  if (typeof localStorage === "undefined") return false
  return localStorage.getItem(KEY) === "true"
}

export function hasEverConnected(): boolean {
  return readFlag()
}

export function markEverConnected(): void {
  if (typeof localStorage === "undefined") return
  if (readFlag()) return
  localStorage.setItem(KEY, "true")
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function clearEverConnected(): void {
  if (typeof localStorage === "undefined") return
  if (!readFlag()) return
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function subscribeEverConnected(onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) {
      onChange()
    }
  }
  window.addEventListener("storage", handleStorage)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

export function getEverConnectedSnapshot(): boolean {
  return readFlag()
}

export function getEverConnectedServerSnapshot(): boolean {
  return false
}
