import Phaser from 'phaser';

export interface InputState {
  up: boolean; down: boolean; left: boolean; right: boolean;
  attack: boolean; // B on the NES pad: wooden spoon
}

// Keyboard (arrows/WASD + Space/J) merged with any connected gamepad (D-pad or left stick, A/B buttons).
export class Controls {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  constructor(private scene: Phaser.Scene) {
    this.keys = scene.input.keyboard!.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,J') as Record<string, Phaser.Input.Keyboard.Key>;
  }

  get pad(): Phaser.Input.Gamepad.Gamepad | undefined {
    return this.scene.input.gamepad?.pad1;
  }

  read(): InputState {
    const k = this.keys;
    const p = this.pad;
    const ax = p?.leftStick.x ?? 0, ay = p?.leftStick.y ?? 0;
    return {
      up: k.UP.isDown || k.W.isDown || !!p?.up || ay < -0.5,
      down: k.DOWN.isDown || k.S.isDown || !!p?.down || ay > 0.5,
      left: k.LEFT.isDown || k.A.isDown || !!p?.left || ax < -0.5,
      right: k.RIGHT.isDown || k.D.isDown || !!p?.right || ax > 0.5,
      attack: k.SPACE.isDown || k.J.isDown || !!p?.A || !!p?.B,
    };
  }
}
