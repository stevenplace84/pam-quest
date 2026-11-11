import data from './overworld-map.json';
import { TILE } from '../config';

// Overworld tile grid exported from the map draft (assets/overworld-map.json in the project files).
// One char per tile; the legend gives each char a name, a photo-sampled color and a solid flag.
export interface TileInfo { name: string; color: string; solid: boolean }

export const legend: Record<string, TileInfo> = data.legend;
export const rows: string[] = data.rows;
export const WIDTH = data.width;   // tiles
export const HEIGHT = data.height; // tiles
export const START = data.start;
export const SCREENS_ACROSS = data.screens.across;
export const SCREENS_DOWN = data.screens.down;

/** Tile chars in a fixed order; a char's index here is its tile index in the tileset. */
export const tileChars = Object.keys(legend).sort();

export function charAt(tx: number, ty: number): string | undefined {
  return rows[ty]?.[tx];
}

/** Outside the map counts as solid, so the world edge is a wall. */
export function isSolidTile(tx: number, ty: number): boolean {
  const c = charAt(tx, ty);
  return c === undefined || legend[c]?.solid !== false;
}

/** True if any tile under the pixel rectangle is solid. */
export function rectHitsWall(x: number, y: number, w: number, h: number): boolean {
  const x0 = Math.floor(x / TILE), x1 = Math.floor((x + w - 1) / TILE);
  const y0 = Math.floor(y / TILE), y1 = Math.floor((y + h - 1) / TILE);
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++)
      if (isSolidTile(tx, ty)) return true;
  return false;
}

/** The nearest walkable tile to the given one (the start tile is the mailbox itself). */
export function nearestOpenTile(sx: number, sy: number): { x: number; y: number } {
  for (let r = 0; r < 10; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++)
        if (Math.max(Math.abs(dx), Math.abs(dy)) === r && !isSolidTile(sx + dx, sy + dy))
          return { x: sx + dx, y: sy + dy };
  return { x: sx, y: sy };
}
