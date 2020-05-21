import * as Phaser from 'phaser';

export interface BlueprintImage extends Phaser.GameObjects.Image {
  resourceImages: Phaser.GameObjects.Image[];
}
