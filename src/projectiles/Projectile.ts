import * as Phaser from 'phaser';
import {PLAY_AREA} from '../constants';
import {ProjectileOpts} from '../interfaces/ProjectileOpts';
import {ProjectileType} from '../interfaces/ProjectileType';

export class Projectile extends Phaser.GameObjects.Image {
  public id: string;

  public speed: number;

  public projectileType: ProjectileType;

  public damage: number;

  constructor(
    {x, y, scene, key}: ProjectileOpts,
    angle: number,
    id: string,
    type: ProjectileType,
    speed: number,
    damage: number,
  ) {
    super(scene, x, y, key);
    this.scene.physics.world.enable(this);
    this.id = id;
    this.projectileType = type;
    this.speed = speed;
    this.damage = damage;
    this.setAngle(angle + 90)
      .setOrigin(0.5, 0.5)
      .setDisplaySize(10, 10);
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      const xVelocity = Math.cos((angle * Math.PI) / 180) * this.speed;
      const yVelocity = Math.sin((angle * Math.PI) / 180) * this.speed;
      this.body.setVelocity(xVelocity, yVelocity);
    }
    scene.add.existing(this);
  }

  public update(): void {
    if (
      this.y <= PLAY_AREA.yOffset ||
      this.y >= PLAY_AREA.yOffset + PLAY_AREA.height ||
      this.x <= PLAY_AREA.xOffset ||
      this.x >= PLAY_AREA.xOffset + PLAY_AREA.width
    ) {
      this.destroy();
    }
  }
}