import * as Phaser from 'phaser';

export class HudScene extends Phaser.Scene {
  private startKey: Phaser.Input.Keyboard.Key;
  private text: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: 'HudScene',
    });
  }

  preload(): void {
    this.startKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.S,
    );
    this.registry.set('playerHp', 3);
  }

  create(): void {
    const level = this.scene.get('GameScene');
    level.events.on('hpChanged', this.updateHp, this);
    this.text = this.add.text(
      10,
      0,
      `HP: ${this.registry.get('playerHp')}`,
    );
  }

  update(): void {
    if (this.startKey.isDown) {
      this.scene.start('GameScene');
    }
  }

  updateHp(): void {
    this.text.setText(`HP: ${this.registry.get('playerHp')}`);
  }
}
