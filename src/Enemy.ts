import * as Phaser from 'phaser';
import {ServerProjectile} from './interfaces';
import {getProjectile, Projectile} from './projectiles';

export class Enemy extends Phaser.GameObjects.Image {
  public playerId: string;

  protected projectiles: Phaser.GameObjects.Group;

  constructor({scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string}, id: string) {
    super(scene, x, y, key);
    this.playerId = id;
    this.projectiles = this.scene.add.group({
      runChildUpdate: true,
    });
    this.setOrigin(0.5, 0.5).setDisplaySize(35, 43);
    scene.physics.world.enable(this);
    scene.add.existing(this);
  }

  public addProjectile(serverProjectile: ServerProjectile): Projectile {
    const projectile = getProjectile(serverProjectile, this.scene);
    this.projectiles.add(projectile);
    return projectile;
  }

  public getProjectiles(): Phaser.GameObjects.Group {
    return this.projectiles;
  }
}
