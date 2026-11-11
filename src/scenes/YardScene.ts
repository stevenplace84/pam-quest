import Phaser from 'phaser';
import { Controls } from '../input';
import { SCREEN_WIDTH as W, SCREEN_HEIGHT as H, HUD_HEIGHT } from '../config';
type Facing = 'up' | 'down' | 'left' | 'right';

// Placeholder overworld screen: proves rendering, movement and controller input end to end.
export class YardScene extends Phaser.Scene {
  private controls!: Controls;
  private pam!: Phaser.GameObjects.Rectangle;
  private spoon!: Phaser.GameObjects.Rectangle;
  private status!: Phaser.GameObjects.Text;
  private facing: Facing = 'down';
  private swingFrames = 0;

  constructor() { super('yard'); }

  create() {
    this.controls = new Controls(this);
    this.add.rectangle(0, HUD_HEIGHT, W, H - HUD_HEIGHT, 0xfcd8a8).setOrigin(0); // NES sand
    const text = { fontFamily: 'monospace', fontSize: '8px', color: '#fcfcfc' };
    this.add.text(8, 8, "PAM'S QUEST", text);
    this.status = this.add.text(8, 24, 'KEYBOARD', text);
    this.pam = this.add.rectangle(120, 140, 16, 16, 0xd82800).setOrigin(0);
    this.spoon = this.add.rectangle(0, 0, 4, 10, 0xa05000).setOrigin(0).setVisible(false);
  }

  update() {
    const i = this.controls.read();
    this.status.setText(this.controls.pad ? 'CONTROLLER READY' : 'KEYBOARD');

    // Zelda 1 style: one axis at a time, no diagonals.
    let dx = 0, dy = 0;
    if (i.left) { dx = -1; this.facing = 'left'; }
    else if (i.right) { dx = 1; this.facing = 'right'; }
    else if (i.up) { dy = -1; this.facing = 'up'; }
    else if (i.down) { dy = 1; this.facing = 'down'; }
    const speed = 1.5;
    this.pam.x = Phaser.Math.Clamp(this.pam.x + dx * speed, 8, W - 24);
    this.pam.y = Phaser.Math.Clamp(this.pam.y + dy * speed, HUD_HEIGHT + 8, H - 24);

    if (i.attack && this.swingFrames === 0) this.swingFrames = 12;
    if (this.swingFrames > 0) this.swingFrames--;
    const o = { up: [6, -10, 4, 10], down: [6, 16, 4, 10], left: [-10, 6, 10, 4], right: [16, 6, 10, 4] }[this.facing];
    this.spoon.setVisible(this.swingFrames > 0).setPosition(this.pam.x + o[0], this.pam.y + o[1]).setSize(o[2], o[3]);
  }
}
