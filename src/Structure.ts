import * as Phaser from 'phaser';

export class Structure extends Phaser.GameObjects.Image {
  public id: string;

  constructor({scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string}, id: string) {
    super(scene, x, y, key);
    this.id = id;
    this.setDisplaySize(35, 34);
    scene.physics.world.enable(this);
    scene.add.existing(this);
  }
}
