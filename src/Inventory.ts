import * as Phaser from 'phaser';
import {v4 as uuid} from 'uuid';
import {Projectile} from './interfaces/Shared';
import {Arrow, Bullet, Laser} from './projectiles';

export class Inventory {
  private scene: Phaser.Scene;

  private blueprints: string[];

  private weapons: string[];

  private nextBlueprint: number;

  private nextWeaponSelect: number;

  private weaponInputs: Phaser.Input.Keyboard.Key[];

  private blueprintNext: Phaser.Input.Keyboard.Key;

  private blueprintPrevious: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.blueprints = ['blueprint-bullet', 'blueprint-laser'];
    this.weapons = ['arrow'];

    const {KeyCodes} = Phaser.Input.Keyboard;
    this.blueprintNext = this.scene.input.keyboard.addKey(KeyCodes.Q);
    this.blueprintPrevious = this.scene.input.keyboard.addKey(KeyCodes.E);
    this.weaponInputs = [
      this.scene.input.keyboard.addKey(KeyCodes.ONE),
      this.scene.input.keyboard.addKey(KeyCodes.TWO),
      this.scene.input.keyboard.addKey(KeyCodes.THREE),
      this.scene.input.keyboard.addKey(KeyCodes.FOUR),
    ];

    this.nextBlueprint = 0;
    this.nextWeaponSelect = 0;
    this.scene.registry.set('weapon', 'arrow');
    this.scene.events.emit('weaponAdded');
    this.scene.events.emit('weaponChanged');
  }

  private handleBlueprintSwap(): void {
    if ((this.blueprintNext.isDown || this.blueprintPrevious.isDown) && this.nextBlueprint < this.scene.time.now) {
      const currentBlueprint = this.scene.registry.get('blueprint');
      if (currentBlueprint === this.blueprints[0]) {
        this.scene.registry.set('blueprint', this.blueprints[1]);
      } else {
        this.scene.registry.set('blueprint', this.blueprints[0]);
        this.scene.registry.set('weapon', 'laser');
      }
      this.scene.events.emit('blueprintChanged');
      this.nextBlueprint = this.scene.time.now + 200;
    }
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

  public update(): void {
    this.handleBlueprintSwap();
    this.handleWeaponSelect();
  }

  public createProjectile(x: number, y: number, angle: number): Projectile {
    const opts = {x, y, scene: this.scene};
    switch (this.scene.registry.get('weapon')) {
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
