import * as Phaser from 'phaser';

export class HudScene extends Phaser.Scene {
  private text: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: 'HudScene',
    });
  }

  preload(): void {
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

  updateHp(): void {
    this.text.setText(`HP: ${this.registry.get('playerHp')}`);
  }
}
