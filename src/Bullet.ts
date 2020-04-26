export class Bullet extends Phaser.GameObjects.Image {
  private speed: number;

  constructor({x, y, scene,  key}: {x: number, y: number, scene: Phaser.Scene, key: string}, angle: number) {
    super(scene, x, y, key)
    this.scene.physics.world.enable(this);
    this.speed = 400;
    this.setAngle(angle).setOrigin(0.5, 0.5).setDisplaySize(10, 10);
    console.log('building bullet')
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      console.log('angle', angle)
      const xVelocity = Math.cos(angle * Math.PI / 180) * this.speed;
      console.log('xVelocity', xVelocity)
      const yVelocity = Math.sin(angle * Math.PI / 180) * this.speed;
      console.log('yVelocity', yVelocity)
      console.log('setting velocity')
      this.body.setVelocity(xVelocity, yVelocity);
    }
    scene.add.existing(this);
  }

  public update(): void {
    if (this.y < 0 || this.y > this.scene.sys.canvas.height || this.x < 0 || this.x > this.scene.sys.canvas.width) {
      console.log(this.x)
      console.log('destroying due to bounds')
      this.destroy();
    }

  }
}
