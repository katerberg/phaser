import * as Phaser from 'phaser';

export class Bullet extends Phaser.GameObjects.Image {
  public id: string;

  public speed: number;

  public damage: number;

  constructor(
    {x, y, scene, key}: {x: number; y: number; scene: Phaser.Scene; key: string},
    angle: number,
    id: string,
    speed?: number,
  ) {
    super(scene, x, y, key);
    this.scene.physics.world.enable(this);
    this.id = id;
    this.speed = speed || 400;
    this.damage = 1;
    this.setAngle(angle).setOrigin(0.5, 0.5).setDisplaySize(10, 10);
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      const xVelocity = Math.cos((angle * Math.PI) / 180) * this.speed;
      const yVelocity = Math.sin((angle * Math.PI) / 180) * this.speed;
      this.body.setVelocity(xVelocity, yVelocity);
    }
    scene.add.existing(this);
  }

  public update(): void {
    if (this.y < 0 || this.y > this.scene.sys.canvas.height || this.x < 0 || this.x > this.scene.sys.canvas.width) {
      this.destroy();
    }
  }
}
