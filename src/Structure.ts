import * as Phaser from 'phaser';

export class Structure extends Phaser.GameObjects.Image {
  constructor({scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string}) {
    super(scene, x, y, key);
    this.setOrigin(0.5, 0.5).setDisplaySize(35, 34);
    scene.physics.world.enable(this);
    scene.add.existing(this);
  }
}
