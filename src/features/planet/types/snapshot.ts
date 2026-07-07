export type IslandId = string

export type HexCell = {
  q: number
  r: number
}

export type Island = {
  id: IslandId
  name: string
  anchor: [number, number] // [phi, theta] on the sphere
  color: string
  cellCount: number
}

export type Territory = {
  githubLogin: string
  islandId: IslandId
  cellCount: number
  cells: HexCell[]
}

export type PlanetSnapshot = {
  version: string
  cellSize: number
  /** Dynamic radius — grows when cell density exceeds the base sphere capacity. */
  planetRadius: number
  islands: Island[]
  territories: Territory[]
}

// Raw API response from GET /planet
export type PlanetApiResponse = {
  updated_at: string
  islands: Record<string, [string, number][]>
}
