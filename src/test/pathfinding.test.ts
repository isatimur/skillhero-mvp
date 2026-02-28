import { describe, it, expect } from 'vitest';
import { findPath, Position } from '@/lib/pathfinding';

// Simple 5x5 grid: 0=passable, 2=mountain (blocked)
const OPEN_GRID = Array(5).fill(null).map(() => Array(5).fill(0));
const BLOCKED_GRID = [
  [0,0,0,0,0],
  [0,2,2,2,0],
  [0,2,0,2,0],
  [0,2,2,2,0],
  [0,0,0,0,0],
];

describe('findPath', () => {
  it('returns empty array when start equals goal', () => {
    const path = findPath({ x: 0, y: 0 }, { x: 0, y: 0 }, OPEN_GRID);
    expect(path).toEqual([]);
  });

  it('finds direct path on open grid', () => {
    const start: Position = { x: 0, y: 0 };
    const path = findPath(start, { x: 3, y: 0 }, OPEN_GRID);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(3);
    expect(path![path!.length - 1]).toEqual({ x: 3, y: 0 });
  });

  it('navigates around obstacles', () => {
    const path = findPath({ x: 0, y: 2 }, { x: 4, y: 2 }, BLOCKED_GRID);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
    for (const pos of path!) {
      expect(BLOCKED_GRID[pos.y][pos.x]).not.toBe(2);
    }
  });

  it('returns null when no path exists', () => {
    const grid = [
      [0,2,0],
      [2,0,2],
      [0,2,0],
    ];
    const path = findPath({ x: 1, y: 1 }, { x: 0, y: 0 }, grid);
    expect(path).toBeNull();
  });

  it('does not include start position in result', () => {
    const path = findPath({ x: 0, y: 0 }, { x: 2, y: 0 }, OPEN_GRID);
    expect(path).not.toBeNull();
    expect(path![0]).not.toEqual({ x: 0, y: 0 });
  });
});
