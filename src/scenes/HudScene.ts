import * as Phaser from 'phaser';
import placeholderResourceImage from '../assets/placeholder-resource.png';
import weaponBulletImage from '../assets/weapon-bullet.png';
import weaponArrowImage from '../assets/weapon-dart.png';
import weaponLaserImage from '../assets/weapon-laser.png';
import weaponSelectorImage from '../assets/weapon-selector.png';
import {BlueprintCard, ResourceCard} from '../cards';
import {BlueprintImage} from '../interfaces';
import {constants} from '../utils/constants';

export class HudScene extends Phaser.Scene {
  private hpText: Phaser.GameObjects.Text | undefined;

  private manaText: Phaser.GameObjects.Text | undefined;

  private blueprintImages: BlueprintImage[];

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
    this.load.image('weapon-selector', weaponSelectorImage);
    this.load.image('placeholder-resource', placeholderResourceImage);
  }

  create(): void {
    const gameLevel = this.scene.get(constants.scenes.game);
    gameLevel.events.on('hpChanged', this.updateHp, this);
    gameLevel.events.on('manaChanged', this.updateMana, this);
    gameLevel.events.on('blueprintChanged', this.updateBlueprint, this);
    gameLevel.events.on('blueprintAdded', this.addBlueprint, this);
    gameLevel.events.on('weaponChanged', this.updateWeapon, this);
    gameLevel.events.on('weaponAdded', this.addWeapon, this);
    gameLevel.events.on('resourceAdded', this.addResource, this);
    this.updateBlueprint();
  }

  private get currentBlueprint(): BlueprintCard {
    return this.registry.get('blueprint') as BlueprintCard;
  }

  private updateBlueprint(): void {
    if (this.blueprintSelection) {
      this.blueprintSelection.destroy();
    }
    const index = this.blueprintList.findIndex((value) => value.id === this.currentBlueprint.id);
    this.blueprintSelection = this.add
      .image(8, 30 + constants.game.weaponHeight * index, 'weapon-selector')
      .setOrigin(0, 0)
      .setScale(0.3);
  }

  private addBlueprint(): void {
    this.blueprintList.push(this.currentBlueprint);
    const blueprintImage = this.add
      .image(8, 32 + constants.game.weaponHeight * this.blueprintImages.length, `weapon-${this.currentBlueprint.image}`)
      .setOrigin(0, 0)
      .setScale(0.3) as BlueprintImage;
    blueprintImage.resourceImages = [];
    Array.from(Array(this.currentBlueprint.resourceCost)).forEach((_, i) => {
      const x = 24 + i * 30;
      const y = 110 + constants.game.weaponHeight * this.blueprintImages.length + 1;
      blueprintImage.resourceImages.push(this.add.image(x, y, 'placeholder-resource').setScale(0.03));
    });
    this.blueprintImages.push(blueprintImage);
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

  private addResource(): void {
    const resource = this.registry.get('resource') as ResourceCard;
    this.currentBlueprint.resources.push(resource);
    const blueprintPosition = this.blueprintList.findIndex((value) => this.currentBlueprint.id === value.id);
    const resourcePosition = this.currentBlueprint.resources.length - 1;
    this.blueprintImages[blueprintPosition].resourceImages[resourcePosition].destroy();
    const x = 24 + resourcePosition * 30;
    const y = 110 + constants.game.weaponHeight * blueprintPosition + 1;
    this.blueprintImages[blueprintPosition].resourceImages[resourcePosition] = this.add
      .image(x, y, `resource-${resource.resourceType}`)
      .setScale(0.03);
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
