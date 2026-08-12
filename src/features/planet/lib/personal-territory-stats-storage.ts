const KEY = "thedevworld_stats_shown"

export function hasPersonalTerritoryStatsBeenShown(): boolean {
  if (typeof sessionStorage === "undefined") return false
  return sessionStorage.getItem(KEY) === "true"
}

export function markPersonalTerritoryStatsShown(): void {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.setItem(KEY, "true")
}
