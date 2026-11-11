import Phaser from 'phaser';
import { Controls, InputState } from './input';
import { TILE } from './config';
import { rectHitsWall } from './map/overworld';

export type Facing = 'up' | 'down' | 'left' | 'right';
const DIRS: Record<Facing, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// Collision box: the lower half of the 16x16 sprite, a bit narrower, like Zelda 1,
// so Pam's head can overlap walls above her and she fits through one-tile gaps.
const BOX = { x: 3, y: 8, w: 10, h: 8 };
const SPEED = 80; // pixels per second
const SLIDE = 7;  // how far (px) Pam is nudged around a corner she clips

/** One player character. Kept as a class (not a singleton) so a second player can join later. */
export class Player {
  x: number; // sprite top-left, world pixels
  y: number;
  facing: Facing = 'down';
  private sprite: Phaser.GameObjects.Image;
  private spoon: Phaser.GameObjects.Image;
  private walkTime = 0;
  private swingMs = 0;

  constructor(scene: Phaser.Scene, public controls: Controls, tileX: number, tileY: number, private prefix = 'pam') {
    this.x = tileX * TILE;
    this.y = tileY * TILE;
    this.sprite = scene.add.image(0, 0, `${prefix}-down-0`).setOrigin(0).setDepth(10);
    this.spoon = scene.add.image(0, 0, 'spoon-up').setOrigin(0).setDepth(11).setVisible(false);
    this.draw();
  }

  /** Center of the collision box, used to decide which screen Pam is on. */
  get feet() { return { x: this.x + BOX.x + BOX.w / 2, y: this.y + BOX.y + BOX.h / 2 }; }

  blocked(x: number, y: number) { return rectHitsWall(x + BOX.x, y + BOX.y, BOX.w, BOX.h); }

  update(dtMs: number, input: InputState = this.controls.read()) {
    if (input.attack && this.swingMs <= 0) this.swingMs = 250;
    if (this.swingMs > 0) { this.swingMs -= dtMs; this.draw(); return; } // Zelda: no walking mid-swing

    // One axis at a time, no diagonals.
    let dir: Facing | null = null;
    if (input.left) dir = 'left';
    else if (input.right) dir = 'right';
    else if (input.up) dir = 'up';
    else if (input.down) dir = 'down';
    if (dir) {
      this.facing = dir;
      this.walkTime += dtMs;
      this.step(dir, (SPEED * dtMs) / 1000);
    }
    this.draw();
  }

  /** Moves along one axis; if the move is blocked near a corner, slides around it. */
  private step(dir: Facing, dist: number) {
    const [dx, dy] = DIRS[dir];
    const nx = this.x + dx * dist, ny = this.y + dy * dist;
    if (!this.blocked(nx, ny)) { this.x = nx; this.y = ny; return; }
    // Move flush against the wall.
    let moved = 0;
    while (moved + 1 <= dist && !this.blocked(this.x + dx, this.y + dy)) { this.x += dx; this.y += dy; moved++; }
    // Corner assist: look a few pixels to each side for an opening and drift toward it.
    for (let off = 1; off <= SLIDE; off++) {
      for (const s of [-1, 1]) {
        const ox = dy !== 0 ? s * off : 0, oy = dx !== 0 ? s * off : 0;
        if (!this.blocked(this.x + ox, this.y + oy) && !this.blocked(this.x + ox + dx, this.y + oy + dy)) {
          const step = Math.min(dist, 1);
          if (!this.blocked(this.x + Math.sign(ox) * step, this.y + Math.sign(oy) * step)) {
            this.x += Math.sign(ox) * step; this.y += Math.sign(oy) * step;
          }
          return;
        }
      }
    }
  }

  /** Walk a fixed distance ignoring walls (used during screen scrolls). */
  nudge(dir: Facing, dist: number) {
    const [dx, dy] = DIRS[dir];
    this.x += dx * dist; this.y += dy * dist;
    this.walkTime += 16;
    this.draw();
  }

  draw() {
    const frame = Math.floor(this.walkTime / 150) % 2;
    const side = this.facing === 'left' || this.facing === 'right';
    this.sprite
      .setTexture(`${this.prefix}-${side ? 'side' : this.facing}-${frame}`)
      .setFlipX(this.facing === 'left')
      .setPosition(Math.round(this.x), Math.round(this.y));

    const swinging = this.swingMs > 0;
    this.spoon.setVisible(swinging);
    if (!swinging) return;
    const px = Math.round(this.x), py = Math.round(this.y);
    switch (this.facing) {
      case 'up': this.spoon.setTexture('spoon-up').setFlip(false, false).setPosition(px + 6, py - 9); break;
      case 'down': this.spoon.setTexture('spoon-up').setFlip(false, true).setPosition(px + 6, py + 15); break;
      case 'right': this.spoon.setTexture('spoon-right').setFlip(false, false).setPosition(px + 15, py + 9); break;
      case 'left': this.spoon.setTexture('spoon-right').setFlip(true, false).setPosition(px - 9, py + 9); break;
    }
  }
}
