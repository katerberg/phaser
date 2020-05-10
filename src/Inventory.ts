import * as Phaser from 'phaser';
import {v4 as uuid} from 'uuid';
import {Projectile} from './interfaces/Shared';
import {Arrow, Bullet, Laser} from './projectiles';

export class Inventory {
  private scene: Phaser.Scene;

  private blueprints: string[];

  private nextBlueprint: number;

  private nextWeaponSelect: number;

  private weaponInputs: Phaser.Input.Keyboard.Key[];

  private blueprintNext: Phaser.Input.Keyboard.Key;

  private blueprintPrevious: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.blueprints = ['blueprint-arrow', 'blueprint-bullet', 'blueprint-laser'];

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
        this.scene.registry.set('weapon', 'arrow');
      } else if (two.isDown) {
        this.scene.registry.set('weapon', 'bullet');
      } else if (three.isDown) {
        this.scene.registry.set('weapon', 'laser');
      } else if (four.isDown) {
        this.scene.registry.set('weapon', 'laser');
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
