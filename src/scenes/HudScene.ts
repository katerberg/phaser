import * as Phaser from 'phaser';
import arrowImage from '../assets/blueprint-arrow.png';
import bulletImage from '../assets/blueprint-bullet.png';
import {constants} from '../utils/constants';

export class HudScene extends Phaser.Scene {
  private hpText: Phaser.GameObjects.Text | undefined;

  private manaText: Phaser.GameObjects.Text | undefined;

  private blueprint: Phaser.GameObjects.Image | undefined;

  constructor() {
    super({
      key: constants.scenes.hud,
    });
  }

  preload(): void {
    this.registry.set('blueprint', 'blueprint-arrow');
    this.registry.set('playerHp', 3);
    this.registry.set('playerMana', 10);
    this.hpText = this.add.text(constants.playArea.xOffset + 12, constants.playArea.yOffset + 8, this.getHPText(), {
      fontSize: '32px',
    });
    this.manaText = this.add
      .text(
        constants.playArea.xOffset + constants.playArea.width - 12,
        constants.playArea.yOffset + 8,
        this.getManaText(),
        {
          fontSize: '32px',
        },
      )
      .setOrigin(1, 0);
    this.load.image('blueprint-arrow', arrowImage);
    this.load.image('blueprint-bullet', bulletImage);
  }

  create(): void {
    const level = this.scene.get(constants.scenes.game);
    level.events.on('hpChanged', this.updateHp, this);
    level.events.on('manaChanged', this.updateMana, this);
    level.events.on('blueprintChanged', this.updateBlueprint, this);
    this.updateBlueprint();
  }

  updateBlueprint(): void {
    if (this.blueprint) {
      this.blueprint.destroy();
    }
    const image = this.registry.get('blueprint');
    this.blueprint = this.add.image(8, 32, image).setOrigin(0, 0);
  }

  updateHp(): void {
    if (!this.hpText) {
      return;
    }
    this.hpText.setText(this.getHPText());
  }

  updateMana(): void {
    if (!this.manaText) {
      return;
    }
    this.manaText.setText(this.getManaText());
  }

  getManaText(): string {
    return `${constants.symbols.energy}:${`${this.registry.get('playerMana')}`.padStart(3, '  ')}`;
  }

  getHPText(): string {
    return `HP: ${this.registry.get('playerHp')}`;
  }
}
