// Stand-in Pam sprite (16x16), drawn from character-notes.md: red/auburn curly hair,
// fair skin, rust dress with black V-trim. Replace with real sprite art later.

const PALETTE: Record<string, string> = {
  H: '#b5401e', // hair
  h: '#7a2a12', // hair shadow
  S: '#f2c29a', // skin
  K: '#1e1e1e', // black trim, eyes, shoes
  W: '#ffffff', // smile
  D: '#c84c0c', // rust dress
  d: '#8f3508', // dress shadow
  w: '#a0703a', // wooden spoon
  b: '#7a5028', // spoon edge
};

const HEAD_DOWN = [
  '................',
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '...HHHSSSSHHH...',
  '...HHSKSSKSHH...',
  '...HHSSSSSSHH...',
  '....hSSWWSSh....',
  '.....SSSSSS.....',
];
const HEAD_UP = [
  '................',
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '...HHHHHHHHHH...',
  '...HHHhHHhHHH...',
  '...HHHHHHHHHH...',
  '....hHHHHHHh....',
  '.....SSSSSS.....',
];
const BODY_FRONT = [
  '....DDKDDKDD....',
  '...SDDDKKDDDS...',
  '...SDDDDDDDDS...',
  '...SdDDDDDDdS...',
  '....DDDDDDDD....',
  '....dDDDDDDd....',
];
const BODY_BACK = [
  '....DDKDDKDD....',
  '...SDDDDDDDDS...',
  '...SDDDDDDDDS...',
  '...SdDDDDDDdS...',
  '....DDDDDDDD....',
  '....dDDDDDDd....',
];
const LEGS = [
  ['.....SS..SS.....', '.....KK..KK.....'],
  ['.....SS..SS.....', '.........KK.....'],
];
const SIDE = [
  '................',
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '....HHHHHSSS....',
  '....HHHHSSKS....',
  '....HHHHSSSS....',
  '.....hHHSSWS....',
  '......SSSSS.....',
  '.....DDKDDD.....',
  '.....DDDKDDS....',
  '.....DDDDDDS....',
  '.....dDDDDD.....',
  '....DDDDDDDD....',
  '....dDDDDDDd....',
];
const SIDE_LEGS = [
  ['......SSSS......', '......KK.KK.....'],
  ['......SSSS......', '.......KKK......'],
];

export const PAM_FRAMES: Record<string, string[]> = {};
for (const f of [0, 1]) {
  PAM_FRAMES[`down-${f}`] = [...HEAD_DOWN, ...BODY_FRONT, ...LEGS[f]];
  PAM_FRAMES[`up-${f}`] = [...HEAD_UP, ...BODY_BACK, ...LEGS[f]];
  PAM_FRAMES[`side-${f}`] = [...SIDE, ...SIDE_LEGS[f]]; // faces right; flip for left
}

// Wooden spoon, pointing up (bowl at the top).
export const SPOON_UP = [
  '.bb.',
  'bwwb',
  'bwwb',
  '.bb.',
  '.w..',
  '.w..',
  '.w..',
  '.w..',
  '.w..',
  '.w..',
];

export function makePixelTexture(scene: Phaser.Scene, key: string, art: string[]) {
  const h = art.length, w = art[0].length;
  const tex = scene.textures.createCanvas(key, w, h)!;
  const ctx = tex.getContext();
  art.forEach((row, y) => [...row].forEach((c, x) => {
    if (PALETTE[c]) { ctx.fillStyle = PALETTE[c]; ctx.fillRect(x, y, 1, 1); }
  }));
  tex.refresh();
}

/** Rotate pixel art 90 degrees clockwise. */
export function rotateArt(art: string[]): string[] {
  const h = art.length, w = art[0].length;
  return Array.from({ length: w }, (_, x) => Array.from({ length: h }, (_, y) => art[h - 1 - y][x]).join(''));
}
