import Phaser from 'phaser';
import { Controls } from '../input';
import { Player, Facing } from '../Player';
import { TILE, SCREEN_COLS, SCREEN_ROWS, SCREEN_WIDTH, HUD_HEIGHT, FONT } from '../config';
import { rows, legend, tileChars, WIDTH, HEIGHT, START, SCREENS_ACROSS, SCREENS_DOWN, nearestOpenTile } from '../map/overworld';
import { makeTileset } from '../art/tiles';
import { PAM_FRAMES, SPOON_UP, makePixelTexture, rotateArt } from '../art/pam';

const SCREEN_W = SCREEN_COLS * TILE; // 256
const SCREEN_H = SCREEN_ROWS * TILE; // 176
const SCROLL_MS = { horizontal: 700, vertical: 500 };

const HEART = [
  '.RR.RR.',
  'RRRRRRR',
  'RRRRRRR',
  '.RRRRR.',
  '..RRR..',
  '...R...',
];

// The backyard overworld: a 4x4 grid of 16x11-tile screens. Like Zelda 1 the camera
// holds still on one screen and flips to the next when Pam walks off an edge.
export class OverworldScene extends Phaser.Scene {
  private players: Player[] = [];
  private screen = { x: 0, y: 0 };
  private scrolling = false;
  private status!: Phaser.GameObjects.Text;
  private miniDot!: Phaser.GameObjects.Rectangle;
  private miniFrame!: Phaser.GameObjects.Rectangle;

  constructor() { super('overworld'); }

  create() {
    this.makeTextures();

    // Tile layer from the map grid.
    const data = rows.map(r => [...r].map(c => tileChars.indexOf(c)));
    const map = this.make.tilemap({ data, tileWidth: TILE, tileHeight: TILE });
    const tiles = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0)!;
    map.createLayer(0, tiles, 0, 0);

    const start = nearestOpenTile(START.x, START.y);
    const pam = new Player(this, new Controls(this), start.x, start.y);
    this.players.push(pam);

    this.makeHud();
    this.screen = this.screenAt(pam.feet.x, pam.feet.y);
    this.cameras.main.setScroll(...this.cameraScrollFor(this.screen.x, this.screen.y));
    this.updateMinimap();
  }

  private makeTextures() {
    makeTileset(this, 'tiles');
    for (const [name, art] of Object.entries(PAM_FRAMES)) makePixelTexture(this, `pam-${name}`, art);
    makePixelTexture(this, 'spoon-up', SPOON_UP);
    makePixelTexture(this, 'spoon-right', rotateArt(SPOON_UP));
    makePixelTexture(this, 'heart', HEART.map(r => r.replace(/R/g, 'D')));

    // 1 pixel per tile overview of the whole yard, for the HUD map.
    const mini = this.textures.createCanvas('minimap', WIDTH, HEIGHT)!;
    const ctx = mini.getContext();
    rows.forEach((r, y) => [...r].forEach((c, x) => {
      ctx.fillStyle = legend[c]?.color ?? '#000'; ctx.fillRect(x, y, 1, 1);
    }));
    mini.refresh();
  }

  private makeHud() {
    const hud = (o: Phaser.GameObjects.GameObject & { setScrollFactor: (n: number) => unknown; setDepth: (n: number) => unknown }) => {
      o.setScrollFactor(0); o.setDepth(100); return o;
    };
    hud(this.add.rectangle(0, 0, SCREEN_WIDTH, HUD_HEIGHT, 0x000000).setOrigin(0));
    const text = (x: number, y: number, s: string, color = '#fcfcfc') =>
      hud(this.add.text(x, y, s, { fontFamily: FONT, fontSize: '8px', color })) as Phaser.GameObjects.Text;

    // Minimap, top-left like Zelda 1.
    const mx = 12, my = 10;
    hud(this.add.image(mx, my, 'minimap').setOrigin(0).setAlpha(0.85));
    this.miniFrame = hud(this.add.rectangle(mx, my, SCREEN_COLS, SCREEN_ROWS).setOrigin(0).setStrokeStyle(1, 0xfcfcfc)) as Phaser.GameObjects.Rectangle;
    this.miniDot = hud(this.add.rectangle(mx, my, 2, 2, 0xfc4040).setOrigin(0)) as Phaser.GameObjects.Rectangle;
    this.tweens.add({ targets: this.miniDot, alpha: 0.2, duration: 300, yoyo: true, repeat: -1 });

    text(92, 10, "PAM'S QUEST");
    text(196, 10, '-LIFE-', '#d82800');
    for (let i = 0; i < 3; i++) hud(this.add.image(204 + i * 9, 22, 'heart').setOrigin(0));
    text(92, 26, 'BACKYARD', '#bcbcbc');
    this.status = text(92, 44, '', '#7c7c7c');
  }

  private screenAt(px: number, py: number) {
    return {
      x: Phaser.Math.Clamp(Math.floor(px / SCREEN_W), 0, SCREENS_ACROSS - 1),
      y: Phaser.Math.Clamp(Math.floor(py / SCREEN_H), 0, SCREENS_DOWN - 1),
    };
  }

  /** Camera scroll so the given screen fills the play area below the HUD. */
  private cameraScrollFor(sx: number, sy: number): [number, number] {
    return [sx * SCREEN_W, sy * SCREEN_H - HUD_HEIGHT];
  }

  private updateMinimap() {
    this.miniFrame.setPosition(12 + this.screen.x * SCREEN_COLS, 10 + this.screen.y * SCREEN_ROWS);
    const p = this.players[0];
    this.miniDot.setPosition(12 + Math.floor(p.feet.x / TILE) - 1, 10 + Math.floor(p.feet.y / TILE) - 1);
  }

  update(_time: number, delta: number) {
    const dt = Math.min(delta, 50);
    const pam = this.players[0];
    this.status.setText(pam.controls.pad ? 'CONTROLLER' : 'ARROWS + SPACE');
    if (this.scrolling) return;

    pam.update(dt);
    this.updateMinimap();

    const next = this.screenAt(pam.feet.x, pam.feet.y);
    if (next.x !== this.screen.x || next.y !== this.screen.y) this.flipTo(next, pam.facing);
  }

  /** Zelda 1 screen scroll: freeze play, slide the camera, walk Pam in from the edge. */
  private flipTo(next: { x: number; y: number }, facing: Facing) {
    this.scrolling = true;
    this.screen = next;
    const [toX, toY] = this.cameraScrollFor(next.x, next.y);
    const cam = this.cameras.main;
    const horizontal = facing === 'left' || facing === 'right';
    const duration = horizontal ? SCROLL_MS.horizontal : SCROLL_MS.vertical;
    let last = 0;
    this.tweens.addCounter({
      from: 0, to: 1, duration,
      onUpdate: tw => {
        const t = tw.getValue() ?? 0;
        // Pam steps 12px into the new screen while it scrolls in, like Link does.
        const walked = t * 12;
        this.players[0].nudge(facing, walked - last);
        last = walked;
      },
    });
    this.tweens.add({
      targets: cam, scrollX: toX, scrollY: toY, duration,
      onComplete: () => { this.scrolling = false; this.updateMinimap(); },
    });
  }
}
