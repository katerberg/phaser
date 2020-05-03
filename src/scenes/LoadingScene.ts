import * as Phaser from 'phaser';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'LoadingScene',
    });
  }

  update(): void {
    this.scene.start('HudScene');
    this.scene.start('GameScene');
    this.scene.bringToTop('HudScene');
  }
}
