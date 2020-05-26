import * as Phaser from 'phaser';
import {SCENES} from '../constants';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENES.loading,
    });
  }

  update(): void {
    this.cameras.main.setBackgroundColor('#FFFFFF');
    this.scene.start(SCENES.cards);
    this.scene.start(SCENES.hud);
    this.scene.start(SCENES.game);
    this.scene.bringToTop(SCENES.hud);
    this.scene.bringToTop(SCENES.cards);
  }
}
