// Screen size in game pixels. 256x240 like NES Zelda 1: a 64px HUD on top and a
// 16x11-tile play area (256x176) below. Phaser scales whole pixels with pixelArt on.
export const TILE = 16;
export const SCREEN_COLS = 16;
export const SCREEN_ROWS = 11;
export const HUD_HEIGHT = 64;
export const SCREEN_WIDTH = SCREEN_COLS * TILE; // 256
export const SCREEN_HEIGHT = HUD_HEIGHT + SCREEN_ROWS * TILE; // 240
export const FONT = '"Press Start 2P", monospace';
