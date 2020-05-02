import * as Phaser from 'phaser';

export class HudScene extends Phaser.Scene {
  private hpText: Phaser.GameObjects.Text;
  private manaText: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: 'HudScene',
    });
  }

  preload(): void {
    this.registry.set('playerHp', 3);
    this.registry.set('playerMana', 10);
  }

  create(): void {
    const level = this.scene.get('GameScene');
    level.events.on('hpChanged', this.updateHp, this);
    level.events.on('manaChanged', this.updateMana, this);
    this.hpText = this.add.text(
      10,
      0,
      `HP: ${this.registry.get('playerHp')}`,
    );
    this.manaText = this.add.text(
      700,
      0,
      `Mana: ${this.registry.get('playerMana')}`,
    );
  }

  updateHp(): void {
    this.hpText.setText(`HP: ${this.registry.get('playerHp')}`);
  }

  updateMana(): void {
    this.manaText.setText(`Mana: ${this.registry.get('playerMana')}`);
  }
}
