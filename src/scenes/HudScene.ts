import * as Phaser from 'phaser';
import arrowImage from '../assets/blueprint-arrow.png';
import {constants} from '../utils/constants';

export class HudScene extends Phaser.Scene {
  private hpText: Phaser.GameObjects.Text | undefined;

  private manaText: Phaser.GameObjects.Text | undefined;

  constructor() {
    super({
      key: constants.scenes.hud,
    });
  }

  preload(): void {
    this.registry.set('playerHp', 3);
    this.registry.set('playerMana', 10);
    this.hpText = this.add.text(
      constants.playArea.xOffset + 12,
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
    this.load.image('blueprint-arrow', arrowImage);
  }

  create(): void {
    const level = this.scene.get(constants.scenes.game);
    level.events.on('hpChanged', this.updateHp, this);
    level.events.on('manaChanged', this.updateMana, this);
    this.add.image(8, 32, 'blueprint-arrow').setOrigin(0, 0).setScale(1.15);
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
