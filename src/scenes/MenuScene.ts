import * as Phaser from 'phaser';
import {constants} from '../utils/constants';

export class MenuScene extends Phaser.Scene {
  private startKey: Phaser.Input.Keyboard.Key | undefined;

  constructor() {
    super({
      key: constants.scenes.menu,
    });
  }

  preload(): void {
    this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  }

  create(): void {
    this.scene.stop(constants.scenes.hud);
    this.scene.stop(constants.scenes.cards);
    this.add.text(constants.game.width / 2 - 5 * 32, constants.game.height / 2 - 32, 'Press S to Start', {
      fontSize: '32px',
    });
  }

  update(): void {
    if (this.startKey && this.startKey.isDown) {
      this.scene.start(constants.scenes.loading);
    }
  }
}
