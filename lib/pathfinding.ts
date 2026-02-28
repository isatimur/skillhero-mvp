export interface Position {
  x: number;
  y: number;
}

// Tile types that block movement
const BLOCKED_TILES = new Set([2, 3]); // mountain, water

interface AStarNode {
  pos: Position;
  g: number;
  h: number;
  f: number;
  parent: AStarNode | null;
}

function heuristic(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * A* pathfinding on a 2D tile grid.
 * Returns the path from start to goal (exclusive of start, inclusive of goal),
 * or null if no path exists, or [] if start === goal.
 */
export function findPath(
  start: Position,
  goal: Position,
  grid: number[][]
): Position[] | null {
  if (start.x === goal.x && start.y === goal.y) return [];

  const rows = grid.length;
  const cols = grid[0].length;
  const key = (p: Position) => `${p.x},${p.y}`;

  const open = new Map<string, AStarNode>();
  const closed = new Set<string>();

  const startNode: AStarNode = {
    pos: start, g: 0, h: heuristic(start, goal), f: heuristic(start, goal), parent: null,
  };
  open.set(key(start), startNode);

  const neighbors = (p: Position): Position[] => [
    { x: p.x, y: p.y - 1 },
    { x: p.x, y: p.y + 1 },
    { x: p.x - 1, y: p.y },
    { x: p.x + 1, y: p.y },
  ].filter(n =>
    n.x >= 0 && n.x < cols && n.y >= 0 && n.y < rows &&
    !BLOCKED_TILES.has(grid[n.y][n.x])
  );

  while (open.size > 0) {
    let current: AStarNode | null = null;
    for (const node of open.values()) {
      if (!current || node.f < current.f) current = node;
    }
    if (!current) break;

    if (current.pos.x === goal.x && current.pos.y === goal.y) {
      const path: Position[] = [];
      let node: AStarNode | null = current;
      while (node && node.parent) {
        path.unshift(node.pos);
        node = node.parent;
      }
      return path;
    }

    open.delete(key(current.pos));
    closed.add(key(current.pos));

    for (const neighborPos of neighbors(current.pos)) {
      const nKey = key(neighborPos);
      if (closed.has(nKey)) continue;
      const g = current.g + 1;
      const existing = open.get(nKey);
      if (!existing || g < existing.g) {
        const h = heuristic(neighborPos, goal);
        open.set(nKey, { pos: neighborPos, g, h, f: g + h, parent: current });
      }
    }
  }

  return null;
}
