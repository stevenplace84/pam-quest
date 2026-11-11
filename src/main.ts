import Phaser from 'phaser';
import { OverworldScene } from './scenes/OverworldScene';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './config';

// Pixel-art screen (size set in config.ts), scaled up with crisp pixels.
function start() {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000000',
    pixelArt: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { gamepad: true },
    scene: [OverworldScene],
  });
}

// Wait (briefly) for the pixel font so HUD text doesn't render in a fallback font.
Promise.race([
  document.fonts.load('8px "Press Start 2P"'),
  new Promise(r => setTimeout(r, 2000)),
]).finally(start);
