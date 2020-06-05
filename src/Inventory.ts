import * as Phaser from 'phaser';
import {BlueprintCard} from './cards';
import {EVENTS, REGISTRIES, RULES, SCENES} from './constants';
import {Projectile} from './interfaces';
import {Weapon} from './Weapon';

export class Inventory {
  private scene: Phaser.Scene;

  private blueprints!: BlueprintCard[];

  private weapons!: Weapon[];

  private nextBlueprint!: number;

  private nextWeaponSelect!: number;

  private weaponInputs: Phaser.Input.Keyboard.Key[];

  private blueprintNext: Phaser.Input.Keyboard.Key;

  private blueprintPrevious: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const {KeyCodes} = Phaser.Input.Keyboard;
    this.blueprintNext = this.scene.input.keyboard.addKey(KeyCodes.E);
    this.blueprintPrevious = this.scene.input.keyboard.addKey(KeyCodes.Q);
    this.weaponInputs = [
      this.scene.input.keyboard.addKey(KeyCodes.ONE),
      this.scene.input.keyboard.addKey(KeyCodes.TWO),
      this.scene.input.keyboard.addKey(KeyCodes.THREE),
      this.scene.input.keyboard.addKey(KeyCodes.FOUR),
    ];

    this.reset();
    this.scene.events.emit(EVENTS.WEAPON_ADDED, this.weapons[0]);
    this.scene.events.emit(EVENTS.WEAPON_CHANGED);
    this.scene.events.emit(EVENTS.BLUEPRINT_ADDED);
    this.scene.events.emit(EVENTS.BLUEPRINT_CHANGED);
    this.scene.events.on(EVENTS.WEAPON_REMOVED, this.handleRemoveWeapon, this);
    this.scene.events.on(EVENTS.REMOVE_BLUEPRINT, this.handleRemoveBlueprint, this);
    this.scene.events.on(EVENTS.NEW_WEAPON_PLAYED, this.handleNewWeapon, this);

    const cardsLevel = this.scene.scene.get(SCENES.cards);
    cardsLevel.events.on(EVENTS.BLUEPRINT_PLAYED, this.handleBlueprintPlay, this);
  }

  public get currentWeapon(): Weapon {
    return this.scene.registry.get(REGISTRIES.CURRENT_WEAPON) as Weapon;
  }

  private reset(): void {
    this.blueprints = [new BlueprintCard(50, 'projectile', 'bullet', 2, 5, 300)];
    this.weapons = [
      new Weapon({
        type: 'arrow',
        costOfShot: 0,
        rechargeDelay: 500,
      }),
    ];
    this.nextBlueprint = 0;
    this.nextWeaponSelect = 0;
    this.scene.registry.set(REGISTRIES.CURRENT_WEAPON, this.weapons[0]);
    this.scene.registry.set(REGISTRIES.CURRENT_BLUEPRINT, this.blueprints[0]);
  }

  private handleBlueprintSwap(): void {
    if ((this.blueprintNext.isDown || this.blueprintPrevious.isDown) && this.nextBlueprint < this.scene.time.now) {
      const currentBlueprint = this.scene.registry.get(REGISTRIES.CURRENT_BLUEPRINT) as BlueprintCard;
      const blueprintIndex = this.blueprints.findIndex((value) => value.id === currentBlueprint.id);
      if (blueprintIndex !== -1) {
        const numberOfBlueprints = this.blueprints.length;
        if (this.blueprintNext.isDown) {
          const newBlueprint = blueprintIndex === numberOfBlueprints - 1 ? 0 : blueprintIndex + 1;
          this.scene.registry.set(REGISTRIES.CURRENT_BLUEPRINT, this.blueprints[newBlueprint]);
        } else {
          const newBlueprint = blueprintIndex === 0 ? numberOfBlueprints - 1 : blueprintIndex - 1;
          this.scene.registry.set(REGISTRIES.CURRENT_BLUEPRINT, this.blueprints[newBlueprint]);
        }
      } else {
        this.scene.registry.set(REGISTRIES.CURRENT_BLUEPRINT, this.blueprints[0]);
      }
      this.scene.events.emit(EVENTS.BLUEPRINT_CHANGED);
      this.nextBlueprint = this.scene.time.now + 200;
    }
  }

  private handleBlueprintPlay(newBlueprint: BlueprintCard): void {
    this.blueprints.push(newBlueprint);
    this.scene.registry.set(REGISTRIES.CURRENT_BLUEPRINT, newBlueprint);
    this.scene.registry.set(REGISTRIES.BLUEPRINTS_NUMBER, this.blueprints.length);
    this.scene.events.emit(EVENTS.BLUEPRINT_ADDED);
    this.scene.events.emit(EVENTS.BLUEPRINT_CHANGED);
  }

  private handleWeaponSelect(): void {
    const [one, two, three, four] = this.weaponInputs;
    if (this.nextWeaponSelect < this.scene.time.now && (one.isDown || two.isDown || three.isDown || four.isDown)) {
      if (one.isDown) {
        this.scene.registry.set(REGISTRIES.CURRENT_WEAPON, this.weapons[0]);
      } else if (two.isDown && this.weapons.length > 1) {
        this.scene.registry.set(REGISTRIES.CURRENT_WEAPON, this.weapons[1]);
      } else if (three.isDown && this.weapons.length > 2) {
        this.scene.registry.set(REGISTRIES.CURRENT_WEAPON, this.weapons[2]);
      } else if (four.isDown && this.weapons.length > 3) {
        this.scene.registry.set(REGISTRIES.CURRENT_WEAPON, this.weapons[3]);
      }
      this.scene.events.emit(EVENTS.WEAPON_CHANGED);
      this.nextWeaponSelect = this.scene.time.now + 100;
    }
  }

  private handleNewWeapon(newWeapon: Weapon): void {
    if (this.weapons.length === RULES.maxWeapons) {
      this.scene.events.emit(EVENTS.WEAPON_REMOVED, 1);
    }
    this.weapons.push(newWeapon);
  }

  private handleRemoveBlueprint(position: number): void {
    this.blueprints.splice(position, 1);
    this.scene.registry.set(REGISTRIES.BLUEPRINTS_NUMBER, this.blueprints.length);
    this.scene.registry.set(REGISTRIES.CURRENT_BLUEPRINT, this.blueprints[this.blueprints.length - 1]);
    this.scene.events.emit(EVENTS.BLUEPRINT_CHANGED);
  }

  private handleRemoveWeapon(weaponPosition: number): void {
    this.weapons.splice(weaponPosition, 1);
  }

  public update(): void {
    this.handleBlueprintSwap();
    this.handleWeaponSelect();
  }

  public createProjectile(x: number, y: number, angle: number): Projectile {
    this.scene.events.emit(EVENTS.PROJECTILE_FIRED);
    const weapon = this.scene.registry.get(REGISTRIES.CURRENT_WEAPON) as Weapon;
    return weapon.createProjectile({
      x,
      y,
      angle,
      scene: this.scene,
    });
  }
}
