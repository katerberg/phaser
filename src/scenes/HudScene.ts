import * as Phaser from 'phaser';
import placeholderResourceImage from '../assets/placeholder-resource.png';
import weaponBulletImage from '../assets/weapon-bullet.png';
import weaponArrowImage from '../assets/weapon-dart.png';
import weaponLaserImage from '../assets/weapon-laser.png';
import weaponSelectorImage from '../assets/weapon-selector.png';
import {BlueprintCard, ResourceCard} from '../cards';
import {EVENTS, SCENES, STARTING, REGISTRIES, PLAY_AREA, GAME, SYMBOLS} from '../constants';
import {BlueprintImage} from '../interfaces';
import {getColor} from '../utils/weapons';
import {Weapon} from '../Weapon';

interface WeaponImage extends Phaser.GameObjects.Image {
  charges?: Phaser.GameObjects.Text;
}

export class HudScene extends Phaser.Scene {
  private hpText: Phaser.GameObjects.Text | undefined;

  private manaText: Phaser.GameObjects.Text | undefined;

  private blueprintImages: BlueprintImage[];

  private blueprintSelection: Phaser.GameObjects.Image | undefined;

  private blueprintList: BlueprintCard[];

  private weaponImages: WeaponImage[];

  private weaponSelection: Phaser.GameObjects.Image | undefined;

  private weaponList: Weapon[];

  constructor() {
    super({
      key: SCENES.hud,
    });

    this.weaponImages = [];
    this.weaponList = [];
    this.blueprintImages = [];
    this.blueprintList = [];
  }

  preload(): void {
    this.reset();
    this.hpText = this.add.text(PLAY_AREA.xOffset + 12, PLAY_AREA.yOffset + 8, this.getHPText(), {
      fontSize: '32px',
    });
    this.manaText = this.add
      .text(PLAY_AREA.xOffset + PLAY_AREA.width - 12, PLAY_AREA.yOffset + 8, this.getManaText(), {
        fontSize: '32px',
      })
      .setOrigin(1, 0);
    this.load.image('weapon-arrow', weaponArrowImage);
    this.load.image('weapon-bullet', weaponBulletImage);
    this.load.image('weapon-laser', weaponLaserImage);
    this.load.image('weapon-selector', weaponSelectorImage);
    this.load.image('placeholder-resource', placeholderResourceImage);
  }

  private reset(): void {
    this.registry.set(REGISTRIES.PLAYER_HP, STARTING.hp);
    this.registry.set(REGISTRIES.PLAYER_ENERGY, STARTING.energy);
    this.weaponImages = [];
    this.weaponList = [];
    this.blueprintImages = [];
    this.blueprintList = [];
  }

  create(): void {
    const cardLevel = this.scene.get(SCENES.cards);
    cardLevel.events.on(EVENTS.RESOURCE_PLAYED, this.addResource, this);
    const gameLevel = this.scene.get(SCENES.game);
    gameLevel.events.on(EVENTS.HP_CHANGED, this.updateHp, this);
    gameLevel.events.on(EVENTS.ENERGY_CHANGED, this.updateMana, this);
    gameLevel.events.on(EVENTS.BLUEPRINT_CHANGED, this.updateBlueprint, this);
    gameLevel.events.on(EVENTS.BLUEPRINT_ADDED, this.addBlueprint, this);
    gameLevel.events.on(EVENTS.WEAPON_CHANGED, this.updateWeapon, this);
    gameLevel.events.on(EVENTS.WEAPON_ADDED, this.addWeapon, this);
    gameLevel.events.on(EVENTS.WEAPON_REMOVED, this.removeWeapon, this);
    gameLevel.events.on(EVENTS.PLAYER_DIED, this.handlePlayerDeath, this);
    gameLevel.events.on(EVENTS.PROJECTILE_FIRED, this.handleProjectileFired, this);
    this.updateBlueprint();
  }

  private handleProjectileFired(): void {
    if (this.currentWeapon.charges !== undefined) {
      this.currentWeapon.charges--;
      const index = this.weaponList.findIndex((weapon) => weapon.id === this.currentWeapon.id);
      this.weaponImages[index].charges?.setText(`Charges: ${this.currentWeapon.charges}`);
      if (!this.currentWeapon.charges) {
        const gameLevel = this.scene.get(SCENES.game);
        gameLevel.events.emit(EVENTS.WEAPON_REMOVED, index);
        this.registry.set(REGISTRIES.CURRENT_WEAPON, this.weaponList[0]);
        this.updateWeapon();
      }
    }
  }

  private handlePlayerDeath(): void {
    Object.values(EVENTS).forEach((event) => {
      this.scene.scene.events.removeListener(event);
    });
    this.reset();
  }

  private get currentWeapon(): Weapon {
    return this.registry.get(REGISTRIES.CURRENT_WEAPON) as Weapon;
  }

  private get currentBlueprint(): BlueprintCard {
    return this.registry.get(REGISTRIES.CURRENT_BLUEPRINT) as BlueprintCard;
  }

  private updateBlueprint(): void {
    if (this.blueprintSelection) {
      this.blueprintSelection.destroy();
    }
    const index = this.blueprintList.findIndex((value) => value.id === this.currentBlueprint.id);
    this.blueprintSelection = this.add
      .image(8, 30 + GAME.weaponHeight * index, 'weapon-selector')
      .setOrigin(0, 0)
      .setScale(0.3);
  }

  private addBlueprint(): void {
    this.blueprintList.push(this.currentBlueprint);
    const blueprintImage = this.add
      .image(8, 32 + GAME.weaponHeight * this.blueprintImages.length, `weapon-${this.currentBlueprint.image}`)
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
    const index = this.weaponList.findIndex((weapon) => weapon.id === this.currentWeapon.id);
    this.weaponSelection = this.add
      .image(GAME.width - 8, 30 + GAME.weaponHeight * index, 'weapon-selector')
      .setOrigin(1, 0)
      .setScale(0.3);
  }

  private addWeapon(weapon: Weapon): void {
    const weaponTag = weapon.weaponImage;
    this.weaponList.push(weapon);
    const weaponX = GAME.width - 8;
    const weaponY = 32 + GAME.weaponHeight * this.weaponImages.length;
    const color0 = getColor(weapon.resourceTypes[0]);
    const color1 = getColor(weapon.resourceTypes[1]);
    this.weaponImages.push(
      this.add
        .image(weaponX, weaponY, `weapon-${weaponTag}`)
        .setOrigin(1, 0)
        .setScale(0.3)
        .setTintFill(color0, color1, color0, color1),
    );
    this.weaponImages[this.weaponImages.length - 1].charges = this.add
      .text(
        GAME.width - GAME.weaponImageWidth - 8,
        weaponY + 10 + GAME.weaponImageHeight,
        `Charges: ${weapon.charges ?? SYMBOLS.infinite}`,
        {
          fontSize: '20px',
        },
      )
      .setColor('#888888')
      .setOrigin(0, 0);
  }

  private removeWeapon(index: number): void {
    this.weaponList.splice(index, 1);
    const weaponImage = this.weaponImages.splice(index, 1)[0];
    weaponImage?.charges?.destroy();
    weaponImage.destroy();
    this.redrawWeapons();
  }

  private redrawWeapons(): void {
    this.weaponImages.forEach((weapon, index) => {
      const weaponY = 32 + GAME.weaponHeight * index;
      weapon.setY(weaponY);
      weapon.charges?.setY(weaponY + 10 + GAME.weaponImageHeight);
    });
  }

  private redrawBlueprints(): void {
    this.blueprintImages.forEach((blueprint, index) => {
      const blueprintY = 32 + GAME.weaponHeight * index;
      blueprint.setY(blueprintY);
      const resourceY = blueprintY + 72;
      blueprint.resourceImages.forEach((resourceImage) => resourceImage.setY(resourceY));
    });
  }

  private addResource(resource: ResourceCard): void {
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
      const gameLevel = this.scene.get(SCENES.game);
      const cardsLevel = this.scene.get(SCENES.cards);
      const weaponFromBlueprint = this.currentBlueprint.createWeapon();
      this.currentBlueprint.resources.forEach((blueprintResource) => {
        cardsLevel.events.emit(EVENTS.ADD_CARD_TO_BOTTOM_OF_DECK, blueprintResource);
        this.blueprintImages[blueprintPosition].resourceImages.forEach((resourceImage) => resourceImage.destroy());
      });
      this.currentBlueprint.reset();
      this.addWeapon(weaponFromBlueprint);
      gameLevel.events.emit(EVENTS.NEW_WEAPON_PLAYED, weaponFromBlueprint);
      if (blueprintPosition !== 0) {
        cardsLevel.events.emit(EVENTS.ADD_CARD_TO_BOTTOM_OF_DECK, this.currentBlueprint);
        this.blueprintList.splice(blueprintPosition, 1);
        this.blueprintImages.splice(blueprintPosition, 1)[0].destroy();
        gameLevel.events.emit(EVENTS.REMOVE_BLUEPRINT, blueprintPosition);
        this.redrawBlueprints();
      } else {
        this.blueprintImages[blueprintPosition].resourceImages = [];
        this.populatePlaceholders(this.blueprintImages[blueprintPosition]);
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
    return `${SYMBOLS.energy}:${`${this.registry.get(REGISTRIES.PLAYER_ENERGY)}`.padStart(3, '  ')}`;
  }

  private getHPText(): string {
    return `HP: ${this.registry.get(REGISTRIES.PLAYER_HP)}`;
  }
}
