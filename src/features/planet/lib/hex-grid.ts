/**
 * Flat-top axial hex coordinate utilities.
 */

export function hexToLocal(
  q: number,
  r: number,
  cellSize: number,
): [number, number] {
  const x = cellSize * (3 / 2) * q
  const y = cellSize * (Math.sqrt(3) / 2) * q + cellSize * Math.sqrt(3) * r
  return [x, y]
}

export const HEX_DIRECTIONS: [number, number][] = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]

export function hexNeighbors(q: number, r: number): [number, number][] {
  return HEX_DIRECTIONS.map(([dq, dr]) => [q + dq, r + dr])
}

export function hexKey(q: number, r: number): string {
  return `${q},${r}`
}
