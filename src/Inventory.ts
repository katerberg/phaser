import * as Phaser from 'phaser';
import {v4 as uuid} from 'uuid';
import {BlueprintCard} from './cards';
import {Projectile} from './interfaces';
import {Arrow, Bullet, Laser} from './projectiles';
import {constants} from './utils/constants';
import {Weapon} from './Weapon';

export class Inventory {
  private scene: Phaser.Scene;

  private blueprints: BlueprintCard[];

  private weapons: Weapon[];

  private nextBlueprint: number;

  private nextWeaponSelect: number;

  private weaponInputs: Phaser.Input.Keyboard.Key[];

  private blueprintNext: Phaser.Input.Keyboard.Key;

  private blueprintPrevious: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.blueprints = [new BlueprintCard(50, 'projectile', 10, 'bullet', 2)];
    this.weapons = [new Weapon('arrow')];

    const {KeyCodes} = Phaser.Input.Keyboard;
    this.blueprintNext = this.scene.input.keyboard.addKey(KeyCodes.E);
    this.blueprintPrevious = this.scene.input.keyboard.addKey(KeyCodes.Q);
    this.weaponInputs = [
      this.scene.input.keyboard.addKey(KeyCodes.ONE),
      this.scene.input.keyboard.addKey(KeyCodes.TWO),
      this.scene.input.keyboard.addKey(KeyCodes.THREE),
      this.scene.input.keyboard.addKey(KeyCodes.FOUR),
    ];

    this.nextBlueprint = 0;
    this.nextWeaponSelect = 0;
    this.scene.registry.set('weapon', this.weapons[0]);
    this.scene.events.emit('weaponAdded', this.weapons[0]);
    this.scene.events.emit('weaponChanged');
    this.scene.registry.set('blueprint', this.blueprints[0]);
    this.scene.events.emit('blueprintAdded');
    this.scene.events.emit('blueprintChanged');
    this.scene.events.on('removeCurrentBlueprint', this.handleRemoveCurrentBlueprint, this);
    this.scene.events.on('newWeaponPlayed', this.handleNewWeapon, this);

    const cardsLevel = this.scene.scene.get(constants.scenes.cards);
    cardsLevel.events.on('blueprintPlayed', this.handleBlueprintPlay, this);
  }

  private handleBlueprintSwap(): void {
    if ((this.blueprintNext.isDown || this.blueprintPrevious.isDown) && this.nextBlueprint < this.scene.time.now) {
      const currentBlueprint = this.scene.registry.get('blueprint') as BlueprintCard;
      const blueprintIndex = this.blueprints.findIndex((value) => value.id === currentBlueprint.id);
      if (blueprintIndex !== -1) {
        const numberOfBlueprints = this.blueprints.length;
        if (this.blueprintNext.isDown) {
          const newBlueprint = blueprintIndex === numberOfBlueprints - 1 ? 0 : blueprintIndex + 1;
          this.scene.registry.set('blueprint', this.blueprints[newBlueprint]);
        } else {
          const newBlueprint = blueprintIndex === 0 ? numberOfBlueprints - 1 : blueprintIndex - 1;
          this.scene.registry.set('blueprint', this.blueprints[newBlueprint]);
        }
      } else {
        this.scene.registry.set('blueprint', this.blueprints[0]);
      }
      this.scene.events.emit('blueprintChanged');
      this.nextBlueprint = this.scene.time.now + 200;
    }
  }

  private handleBlueprintPlay(): void {
    const newBlueprint = this.scene.registry.get('blueprintPlayed');
    this.blueprints.push(newBlueprint);
    this.scene.registry.set('blueprint', newBlueprint);
    this.scene.registry.set('blueprintCount', this.blueprints.length);
    this.scene.events.emit('blueprintAdded');
    this.scene.events.emit('blueprintChanged');
  }

  private handleWeaponSelect(): void {
    const [one, two, three, four] = this.weaponInputs;
    if (this.nextWeaponSelect < this.scene.time.now && (one.isDown || two.isDown || three.isDown || four.isDown)) {
      if (one.isDown) {
        this.scene.registry.set('weapon', this.weapons[0]);
      } else if (two.isDown && this.weapons.length > 1) {
        this.scene.registry.set('weapon', this.weapons[1]);
      } else if (three.isDown && this.weapons.length > 2) {
        this.scene.registry.set('weapon', this.weapons[2]);
      } else if (four.isDown && this.weapons.length > 3) {
        this.scene.registry.set('weapon', this.weapons[3]);
      }
      this.scene.events.emit('weaponChanged');
      this.nextWeaponSelect = this.scene.time.now + 100;
    }
  }

  private handleNewWeapon(newWeapon: Weapon): void {
    if (this.weapons.length === constants.rules.maxWeapons) {
      const removedWeapon = this.weapons.splice(1, 1);
      this.scene.events.emit('weaponRemoved', removedWeapon);
    }
    this.weapons.push(newWeapon);
  }

  private handleRemoveCurrentBlueprint(): void {
    this.blueprints.pop();
    this.scene.registry.set('blueprintCount', this.blueprints.length);
    this.scene.registry.set('blueprint', this.blueprints[this.blueprints.length - 1]);
    this.scene.events.emit('blueprintChanged');
  }

  public update(): void {
    this.handleBlueprintSwap();
    this.handleWeaponSelect();
  }

  public createProjectile(x: number, y: number, angle: number): Projectile {
    const opts = {x, y, scene: this.scene};
    switch (this.scene.registry.get('weapon').weaponImage) {
      case 'arrow':
        return new Arrow({...opts, key: 'arrow'}, angle, uuid());
      case 'bullet':
        return new Bullet({...opts, key: 'bullet'}, angle, uuid());
      case 'laser':
        return new Laser({...opts, key: 'laser'}, angle, uuid());
      default:
        throw new Error();
    }
  }
}
