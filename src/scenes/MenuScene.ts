import * as Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private startKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super({
      key: 'MenuScene',
    });
  }

  preload(): void {
    this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  }

  create(): void {
    this.add.text(400 - 5 * 32, 300 - 32, 'Press S to Start', {fontSize: '32px'});
  }

  update(): void {
    if (this.startKey.isDown) {
      this.scene.start('HudScene');
      this.scene.start('GameScene');
      this.scene.bringToTop('HudScene');
    }
  }
}
