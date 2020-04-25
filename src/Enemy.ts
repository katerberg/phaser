export class Enemy extends Phaser.GameObjects.Image {
  public playerId: string;

  constructor({scene,x,y,key}: {scene: Phaser.Scene, x: number, y: number, key: string}, id: string) {
    super(scene, x, y, key);
    this.playerId = id;
    this.setOrigin(0.5, 0.5).setDisplaySize(53, 40)
    scene.physics.world.enable(this);
    scene.add.existing(this);
  }
}
