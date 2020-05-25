import * as Phaser from 'phaser';
import {Projectile, ProjectileType} from '../interfaces';
import {constants} from '../utils/constants';

export class Bullet extends Phaser.GameObjects.Image implements Projectile {
  public id: string;

  public speed: number;

  public damage: number;

  public projectileType: ProjectileType;

  constructor({x, y, scene, key}: {x: number; y: number; scene: Phaser.Scene; key: string}, angle: number, id: string) {
    super(scene, x, y, key);
    this.scene.physics.world.enable(this);
    this.id = id;
    this.projectileType = 'bullet';
    this.speed = constants.speed.bullet;
    this.damage = 2;
    this.setAngle(angle).setOrigin(0.5, 0.5).setDisplaySize(10, 10);
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      const xVelocity = Math.cos((angle * Math.PI) / 180) * this.speed;
      const yVelocity = Math.sin((angle * Math.PI) / 180) * this.speed;
      this.body.setVelocity(xVelocity, yVelocity);
    }
    scene.add.existing(this);
  }

  public update(): void {
    if (
      this.y <= constants.playArea.yOffset ||
      this.y >= constants.playArea.yOffset + constants.playArea.height ||
      this.x <= constants.playArea.xOffset ||
      this.x >= constants.playArea.xOffset + constants.playArea.width
    ) {
      this.destroy();
    }
  }
}
