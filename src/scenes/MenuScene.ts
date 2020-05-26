import * as Phaser from 'phaser';
import {SCENES, GAME} from '../constants';

export class MenuScene extends Phaser.Scene {
  private startKey: Phaser.Input.Keyboard.Key | undefined;

  constructor() {
    super({
      key: SCENES.menu,
    });
  }

  preload(): void {
    this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  }

  create(): void {
    this.scene.stop(SCENES.hud);
    this.scene.stop(SCENES.cards);
    this.add.text(GAME.width / 2 - 5 * 32, GAME.height / 2 - 32, 'Press S to Start', {
      fontSize: '32px',
    });
  }

  update(): void {
    if (this.startKey && this.startKey.isDown) {
      this.scene.start(SCENES.loading);
    }
  }
}
