import * as Phaser from 'phaser';
import {constants} from '../utils/constants';

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
    this.hpText = this.add.text(
      constants.playArea.xOffset + 10,
      constants.playArea.yOffset + 8,
      `HP: ${this.registry.get('playerHp')}`,
      {fontSize: '32px'},
    );
    this.manaText = this.add.text(
      constants.playArea.xOffset + constants.playArea.width - 32 * 6,
      constants.playArea.yOffset + 8,
      `Mana: ${this.registry.get('playerMana')}`,
      {
        fontSize: '32px',
      },
    );
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
