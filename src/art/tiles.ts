import { TILE } from '../config';
import { legend, tileChars } from '../map/overworld';

// Draws one 16x16 tile per map char onto a canvas strip. Base colors come from the map
// legend (sampled from Steve's photos); the small patterns just add NES-style texture.

type Px = (x: number, y: number, color: string) => void;

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Lighten (f > 1) or darken (f < 1) a #rrggbb color. */
export function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

const col = (c: string) => legend[c]?.color ?? '#ff00ff';

function speckle(px: Px, rand: () => number, color: string, count: number) {
  for (let i = 0; i < count; i++) px(Math.floor(rand() * TILE), Math.floor(rand() * TILE), color);
}

function blades(px: Px, rand: () => number, color: string, count: number) {
  for (let i = 0; i < count; i++) {
    const x = 1 + Math.floor(rand() * 14), y = 2 + Math.floor(rand() * 12);
    px(x, y, color); px(x, y - 1, color); if (rand() < 0.5) px(x + 1, y - 2, color);
  }
}

function drawTile(c: string, px: Px, fill: (x: number, y: number, w: number, h: number, color: string) => void) {
  const base = col(c);
  const rand = rng(c.charCodeAt(0) * 7919);
  fill(0, 0, TILE, TILE, base);
  const dark = shade(base, 0.8), light = shade(base, 1.15);
  switch (c) {
    case 'g': blades(px, rand, shade(base, 0.85), 3); break;
    case 'G': blades(px, rand, shade(col('g'), 0.7), 6); break;
    case 'M': speckle(px, rand, shade(base, 0.7), 22); speckle(px, rand, shade(base, 1.25), 12); break;
    case 't': case 'T': // tree canopy: leafy clumps
      for (let i = 0; i < 18; i++) {
        const x = Math.floor(rand() * 14), y = Math.floor(rand() * 14);
        fill(x, y, 2, 2, rand() < 0.5 ? shade(base, 1.35) : shade(base, 0.7));
      }
      break;
    case 'F': // dark slatted privacy fence
      for (let x = 0; x < TILE; x += 4) fill(x, 0, 1, TILE, shade(base, 0.6));
      fill(0, 3, TILE, 1, shade(base, 1.3)); fill(0, 12, TILE, 1, shade(base, 1.3));
      break;
    case 'w': // wooden gate: vertical boards and a cross brace
      for (let x = 0; x < TILE; x += 4) fill(x, 0, 1, TILE, shade(base, 0.7));
      for (let i = 0; i < TILE; i++) px(i, i, shade(base, 0.6));
      break;
    case 'D': case 'd': // weathered deck boards, running north-south
      for (let x = 0; x < TILE; x += 4) fill(x, 0, 1, TILE, dark);
      speckle(px, rand, light, 6);
      break;
    case 'B': // brick
      for (let y = 0; y < TILE; y += 4) {
        fill(0, y, TILE, 1, shade(base, 1.3));
        for (let x = (y / 4) % 2 ? 4 : 0; x < TILE; x += 8) fill(x, y, 1, 4, shade(base, 1.3));
      }
      break;
    case 'R': case 'r': // shingle roof
      for (let y = 0; y < TILE; y += 4) {
        fill(0, y + 3, TILE, 1, shade(base, 0.7));
        for (let x = (y / 4) % 2 ? 2 : 6; x < TILE; x += 8) fill(x, y, 1, 3, shade(base, 0.75));
      }
      break;
    case 'Z': case 'V': case 'A': case 'S': // horizontal siding
      for (let y = 3; y < TILE; y += 4) fill(0, y, TILE, 1, dark);
      break;
    case 'L': case 'l': // stone pavers
      fill(0, 0, TILE, 1, shade(base, 0.75)); fill(0, 0, 1, TILE, shade(base, 0.75));
      speckle(px, rand, dark, 8); speckle(px, rand, light, 6);
      break;
    case 'c': // driveway concrete with a joint line
      fill(0, 0, TILE, 1, shade(base, 0.85)); speckle(px, rand, dark, 10);
      break;
    case 'y': // sidewalk
      fill(0, 0, TILE, 1, shade(base, 0.85)); fill(0, 0, 1, TILE, shade(base, 0.85)); speckle(px, rand, dark, 4);
      break;
    case 'h': speckle(px, rand, shade(base, 1.2), 14); speckle(px, rand, shade(base, 0.8), 10); break;
    case 'u': // street lane mark: dashes on asphalt
      fill(0, 0, TILE, TILE, col('h')); speckle(px, rand, shade(col('h'), 1.2), 14);
      fill(7, 2, 2, 12, base);
      break;
    case 'Q': // hot tub cover: dark with a lighter rim and a seam
      fill(0, 0, TILE, 1, shade(base, 2)); fill(0, 0, 1, TILE, shade(base, 2));
      fill(0, 8, TILE, 1, shade(base, 1.6));
      break;
    case 's': case 'x': case 'j': // cushions and furniture
      fill(0, 0, TILE, TILE, shade(base, 0.75)); fill(1, 1, 14, 14, base); fill(2, 2, 12, 3, light);
      break;
    case 'o': // planter: pot with green leaves
      fill(0, 0, TILE, TILE, col('g')); fill(2, 2, 12, 12, base); fill(4, 4, 8, 8, '#4c8a2e');
      px(6, 6, '#7fb84a'); px(9, 8, '#7fb84a');
      break;
    case 'e': // flower bed
      fill(0, 0, TILE, TILE, col('g'));
      for (let i = 0; i < 9; i++) { const x = 1 + Math.floor(rand() * 13), y = 1 + Math.floor(rand() * 13); fill(x, y, 2, 2, base); }
      break;
    case 'n': // wall fountain
      fill(2, 2, 12, 12, shade(base, 0.8)); fill(4, 4, 8, 8, '#4f8fb8'); px(7, 6, '#d8f0ff');
      break;
    case 'p': // white trim / doors / mailbox / railing
      fill(0, 0, TILE, 1, shade(base, 0.75)); fill(0, 15, TILE, 1, shade(base, 0.75));
      fill(0, 0, 1, TILE, shade(base, 0.75)); fill(15, 0, 1, TILE, shade(base, 0.75));
      break;
    case 'k': break; // dark openings stay flat black
  }
}

/** Creates the tileset texture under `key`; tile index i = tileChars[i]. */
export function makeTileset(scene: Phaser.Scene, key: string) {
  const tex = scene.textures.createCanvas(key, tileChars.length * TILE, TILE)!;
  const ctx = tex.getContext();
  tileChars.forEach((c, i) => {
    const ox = i * TILE;
    const fill = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color; ctx.fillRect(ox + x, y, w, h);
    };
    const px: Px = (x, y, color) => {
      if (x >= 0 && y >= 0 && x < TILE && y < TILE) fill(x, y, 1, 1, color);
    };
    drawTile(c, px, fill);
  });
  tex.refresh();
}
