import * as Phaser from 'phaser';
import placeholderResourceImage from '../assets/placeholder-resource.png';
import weaponBulletImage from '../assets/weapon-bullet.png';
import weaponArrowImage from '../assets/weapon-dart.png';
import weaponLaserImage from '../assets/weapon-laser.png';
import weaponSelectorImage from '../assets/weapon-selector.png';
import {BlueprintCard, ResourceCard} from '../cards';
import {BlueprintImage} from '../interfaces';
import {constants} from '../utils/constants';
import {Weapon} from '../Weapon';

export class HudScene extends Phaser.Scene {
  private hpText: Phaser.GameObjects.Text | undefined;

  private manaText: Phaser.GameObjects.Text | undefined;

  private blueprintImages: BlueprintImage[];

  private blueprintSelection: Phaser.GameObjects.Image | undefined;

  private blueprintList: BlueprintCard[];

  private weaponImages: Phaser.GameObjects.Image[];

  private weaponSelection: Phaser.GameObjects.Image | undefined;

  private weaponList: Weapon[];

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
    this.reset();
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

  private reset(): void {
    this.registry.set('playerHp', 3);
    this.registry.set('playerMana', 10);
    this.weaponImages = [];
    this.weaponList = [];
    this.blueprintImages = [];
    this.blueprintList = [];
  }

  create(): void {
    const gameLevel = this.scene.get(constants.scenes.game);
    gameLevel.events.on(constants.events.HP_CHANGED, this.updateHp, this);
    gameLevel.events.on(constants.events.ENERGY_CHANGED, this.updateMana, this);
    gameLevel.events.on(constants.events.BLUEPRINT_CHANGED, this.updateBlueprint, this);
    gameLevel.events.on(constants.events.BLUEPRINT_ADDED, this.addBlueprint, this);
    gameLevel.events.on(constants.events.WEAPON_CHANGED, this.updateWeapon, this);
    gameLevel.events.on(constants.events.WEAPON_ADDED, this.addWeapon, this);
    gameLevel.events.on(constants.events.WEAPON_REMOVED, this.removeWeapon, this);
    gameLevel.events.on(constants.events.RESOURCE_ADDED, this.addResource, this);
    gameLevel.events.on(constants.events.PLAYER_DIED, this.handlePlayerDeath, this);
    this.updateBlueprint();
  }

  private handlePlayerDeath(): void {
    Object.values(constants.events).forEach((event) => {
      this.scene.scene.events.removeListener(event);
    });
    this.reset();
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
    this.populatePlaceholders(blueprintImage);
    this.blueprintImages.push(blueprintImage);
  }

  private populatePlaceholders(blueprintImage: BlueprintImage): void {
    Array.from(Array(this.currentBlueprint.resourceCost)).forEach((_, i) => {
      const x = 24 + i * 30;
      const y = blueprintImage.y + 72;
      blueprintImage.resourceImages.push(this.add.image(x, y, 'placeholder-resource').setScale(0.03));
    });
  }

  private updateWeapon(): void {
    if (this.weaponSelection) {
      this.weaponSelection.destroy();
    }
    const currentWeapon = this.registry.get('weapon');
    const index = this.weaponList.findIndex((weapon) => weapon.id === currentWeapon.id);
    this.weaponSelection = this.add
      .image(constants.game.width - 8, 30 + constants.game.weaponHeight * index, 'weapon-selector')
      .setOrigin(1, 0)
      .setScale(0.3);
  }

  private addWeapon(weapon: Weapon): void {
    const weaponTag = weapon.weaponImage;
    this.weaponList.push(weapon);
    this.weaponImages.push(
      this.add
        .image(
          constants.game.width - 8,
          32 + constants.game.weaponHeight * this.weaponImages.length,
          `weapon-${weaponTag}`,
        )
        .setOrigin(1, 0)
        .setScale(0.3),
    );
  }

  private removeWeapon(weapon: Weapon): void {
    const index = this.weaponList.findIndex((current) => current.id === weapon.id);
    this.weaponList.splice(index, 1);
    this.weaponImages.splice(index, 1)[0].destroy();
  }

  private addResource(): void {
    const resource = this.registry.get('resource') as ResourceCard;
    this.currentBlueprint.resources.push(resource);
    const blueprintPosition = this.blueprintList.findIndex((value) => this.currentBlueprint.id === value.id);
    const resourcePosition = this.currentBlueprint.resources.length - 1;
    this.blueprintImages[blueprintPosition].resourceImages[resourcePosition].destroy();
    const x = 24 + resourcePosition * 30;
    const y = this.blueprintImages[blueprintPosition].y + 72;
    this.blueprintImages[blueprintPosition].resourceImages[resourcePosition] = this.add
      .image(x, y, `resource-${resource.resourceType}`)
      .setScale(0.03);

    if (this.currentBlueprint.resources.length === this.currentBlueprint.resourceCost) {
      const cardsLevel = this.scene.get(constants.scenes.cards);
      this.currentBlueprint.resources.forEach((blueprintResource) => {
        cardsLevel.events.emit(constants.events.ADD_CARD_TO_DECK, blueprintResource);
        this.blueprintImages[blueprintPosition].resourceImages.forEach((resourceImage) => resourceImage.destroy());
      });
      this.currentBlueprint.resources = [];
      const gameLevel = this.scene.get(constants.scenes.game);
      this.addWeapon(this.currentBlueprint.weapon);
      gameLevel.events.emit(constants.events.NEW_WEAPON_PLAYED, this.currentBlueprint.weapon);
      if (blueprintPosition !== 0) {
        cardsLevel.events.emit(constants.events.ADD_CARD_TO_DECK, this.currentBlueprint);
        this.blueprintList.splice(blueprintPosition, 1);
        this.blueprintImages.splice(blueprintPosition, 1)[0].destroy();
        gameLevel.events.emit(constants.events.REMOVE_CURRENT_BLUEPRINT);
      } else {
        const image = this.blueprintImages[blueprintPosition];
        image.resourceImages.forEach((resourceImage) => resourceImage.destroy());
        this.populatePlaceholders(image);
      }
    }
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
