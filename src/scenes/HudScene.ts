import * as Phaser from 'phaser';
import weaponBulletImage from '../assets/weapon-bullet.png';
import weaponArrowImage from '../assets/weapon-dart.png';
import weaponLaserImage from '../assets/weapon-laser.png';
import weaponSelector from '../assets/weapon-selector.png';
import {BlueprintCard} from '../BlueprintCard';
import {constants} from '../utils/constants';

export class HudScene extends Phaser.Scene {
  private hpText: Phaser.GameObjects.Text | undefined;

  private manaText: Phaser.GameObjects.Text | undefined;

  private blueprintImages: Phaser.GameObjects.Image[];

  private blueprintSelection: Phaser.GameObjects.Image | undefined;

  private blueprintList: BlueprintCard[];

  private weaponImages: Phaser.GameObjects.Image[];

  private weaponSelection: Phaser.GameObjects.Image | undefined;

  private weaponList: string[];

  constructor() {
    super({
      key: constants.scenes.hud,
    });

    this.weaponImages = [];
    this.weaponList = [];
    this.blueprintImages = [];
    this.blueprintList = [];
  }

  preload(): void {
    this.registry.set('blueprint', 'arrow');
    this.registry.set('weapon', 'arrow');
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
    this.load.image('weapon-arrow', weaponArrowImage);
    this.load.image('weapon-bullet', weaponBulletImage);
    this.load.image('weapon-laser', weaponLaserImage);
    this.load.image('weapon-selector', weaponSelector);
  }

  create(): void {
    const gameLevel = this.scene.get(constants.scenes.game);
    gameLevel.events.on('hpChanged', this.updateHp, this);
    gameLevel.events.on('manaChanged', this.updateMana, this);
    gameLevel.events.on('blueprintChanged', this.updateBlueprint, this);
    gameLevel.events.on('blueprintAdded', this.addBlueprint, this);
    gameLevel.events.on('weaponChanged', this.updateWeapon, this);
    gameLevel.events.on('weaponAdded', this.addWeapon, this);
    this.updateBlueprint();
  }

  private getCurrentBlueprint(): BlueprintCard {
    return this.registry.get('blueprint') as BlueprintCard;
  }

  private updateBlueprint(): void {
    if (this.blueprintSelection) {
      this.blueprintSelection.destroy();
    }
    const currentBlueprint = this.getCurrentBlueprint();
    const index = this.blueprintList.findIndex((value) => value.id === currentBlueprint.id);
    this.blueprintSelection = this.add
      .image(8, 30 + constants.game.weaponHeight * index, 'weapon-selector')
      .setOrigin(0, 0)
      .setScale(0.3);
  }

  private addBlueprint(): void {
    const blueprint = this.getCurrentBlueprint();
    this.blueprintList.push(blueprint);
    this.blueprintImages.push(
      this.add
        .image(8, 32 + constants.game.weaponHeight * this.blueprintImages.length, `weapon-${blueprint.image}`)
        .setOrigin(0, 0)
        .setScale(0.3),
    );
  }

  private updateWeapon(): void {
    if (this.weaponSelection) {
      this.weaponSelection.destroy();
    }
    const weapon = `weapon-${this.registry.get('weapon')}`;
    const index = this.weaponList.indexOf(weapon);
    this.weaponSelection = this.add
      .image(constants.game.width - 8, 30 + constants.game.weaponHeight * index, 'weapon-selector')
      .setOrigin(1, 0)
      .setScale(0.3);
  }

  private addWeapon(): void {
    const weapon = `weapon-${this.registry.get('weapon')}`;
    this.weaponList.push(weapon);
    this.weaponImages.push(
      this.add
        .image(constants.game.width - 8, 32 + constants.game.weaponHeight * this.weaponImages.length, weapon)
        .setOrigin(1, 0)
        .setScale(0.3),
    );
  }

  private updateHp(): void {
    if (!this.hpText) {
      return;
    }
    this.hpText.setText(this.getHPText());
  }

  private updateMana(): void {
    if (!this.manaText) {
      return;
    }
    this.manaText.setText(this.getManaText());
  }

  private getManaText(): string {
    return `${constants.symbols.energy}:${`${this.registry.get('playerMana')}`.padStart(3, '  ')}`;
  }

  private getHPText(): string {
    return `HP: ${this.registry.get('playerHp')}`;
  }
}
