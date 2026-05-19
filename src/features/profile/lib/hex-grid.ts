// Flat-top axial hex coordinates
export const CELL_SIZE = 0.52;
export const CELL_HEIGHT = 0.12;
export const CELL_GAP = 0.89;

export function hexToLocal(
  q: number,
  r: number,
  cellSize = CELL_SIZE,
): [number, number] {
  const x = cellSize * (3 / 2) * q;
  const y = cellSize * (Math.sqrt(3) / 2) * q + cellSize * Math.sqrt(3) * r;
  return [x, y];
}

export const HEX_DIRECTIONS: [number, number][] = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];

export function hexNeighbors(q: number, r: number): [number, number][] {
  return HEX_DIRECTIONS.map(([dq, dr]) => [q + dq, r + dr] as [number, number]);
}

export function hexKey(q: number, r: number): string {
  return `${q},${r}`;
}

/** BFS flood-fill from center, returns up to `count` hex coords in spiral order. */
export function hexSpiral(count: number): [number, number][] {
  const result: [number, number][] = [[0, 0]];
  const visited = new Set<string>([hexKey(0, 0)]);
  const queue: [number, number][] = [[0, 0]];

  while (result.length < count && queue.length > 0) {
    const [q, r] = queue.shift()!;
    for (const [nq, nr] of hexNeighbors(q, r)) {
      const k = hexKey(nq, nr);
      if (!visited.has(k)) {
        visited.add(k);
        result.push([nq, nr]);
        queue.push([nq, nr]);
        if (result.length >= count) break;
      }
    }
  }

  return result;
}
