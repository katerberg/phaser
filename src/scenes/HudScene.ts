import * as Phaser from 'phaser';

export class HudScene extends Phaser.Scene {
  private hpText: Phaser.GameObjects.Text | undefined;

  private manaText: Phaser.GameObjects.Text | undefined;

  constructor() {
    super({
      key: 'HudScene',
    });
  }

  preload(): void {
    this.registry.set('playerHp', 3);
    this.registry.set('playerMana', 10);
    this.hpText = this.add.text(10, 5, `HP: ${this.registry.get('playerHp')}`, {fontSize: '32px'});
    this.manaText = this.add.text(700, 5, `Mana: ${this.registry.get('playerMana')}`);
  }

  create(): void {
    const level = this.scene.get('GameScene');
    level.events.on('hpChanged', this.updateHp, this);
    level.events.on('manaChanged', this.updateMana, this);
  }

  updateHp(): void {
    if (!this.hpText) {
      return;
    }
    this.hpText.setText(`HP: ${this.registry.get('playerHp')}`);
  }

  updateMana(): void {
    if (!this.manaText) {
      return;
    }
    this.manaText.setText(`Mana: ${this.registry.get('playerMana')}`);
  }
}
