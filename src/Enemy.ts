import * as Phaser from 'phaser';
import {Bullet} from './Bullet';
import {ServerProjectile} from './interfaces/Shared';

export class Enemy extends Phaser.GameObjects.Image {
  public playerId: string;

  private projectiles: Phaser.GameObjects.Group;

  constructor({scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string}, id: string) {
    super(scene, x, y, key);
    this.playerId = id;
    this.projectiles = this.scene.add.group({
      runChildUpdate: true,
    });
    this.setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    scene.physics.world.enable(this);
    scene.add.existing(this);
  }

  public addProjectile(projectile: ServerProjectile): void {
    const bullet = new Bullet(
      {
        x: projectile.x,
        y: projectile.y,
        scene: this.scene,
        key: 'bullet',
      },
      projectile.angle,
      projectile.speed,
    );
    this.projectiles.add(bullet);
  }

  public getProjectiles(): Phaser.GameObjects.Group {
    return this.projectiles;
  }
}
