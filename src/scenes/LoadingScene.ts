import * as Phaser from 'phaser';
import {constants} from '../utils/constants';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: constants.scenes.loading,
    });
  }

  update(): void {
    this.scene.start(constants.scenes.hud);
    this.scene.start(constants.scenes.game);
    this.scene.bringToTop(constants.scenes.hud);
  }
}
