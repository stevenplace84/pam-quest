import Phaser from 'phaser';
import { YardScene } from './scenes/YardScene';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './config';

// Pixel-art screen (size set in config.ts), scaled up with crisp pixels.
new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  backgroundColor: '#000000',
  pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { gamepad: true },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [YardScene],
});
