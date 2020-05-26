import * as Phaser from 'phaser';
import {SPEED, PLAY_AREA} from '../constants';
import {ProjectileType, Projectile} from '../interfaces';

export class Laser extends Phaser.GameObjects.Image implements Projectile {
  public id: string;

  public speed: number;

  public projectileType: ProjectileType;

  public damage: number;

  constructor({x, y, scene, key}: {x: number; y: number; scene: Phaser.Scene; key: string}, angle: number, id: string) {
    super(scene, x, y, key);
    this.scene.physics.world.enable(this);
    this.id = id;
    this.projectileType = 'laser';
    this.speed = SPEED.laser;
    this.damage = 1;
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
