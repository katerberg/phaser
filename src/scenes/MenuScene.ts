import * as Phaser from 'phaser';
import {SCENES, GAME} from '../constants';

export class MenuScene extends Phaser.Scene {
  private startKey: Phaser.Input.Keyboard.Key | undefined;

  private deckbuildKey: Phaser.Input.Keyboard.Key | undefined;

  constructor() {
    super({
      key: SCENES.menu,
    });
  }

  preload(): void {
    this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.deckbuildKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  create(): void {
    this.scene.stop(SCENES.hud);
    this.scene.stop(SCENES.cards);
    this.add
      .text(GAME.width / 2, GAME.height / 2 - 32, 'Press S to Start', {
        fontSize: '32px',
      })
      .setOrigin(0.5, 0);
    this.add
      .text(GAME.width / 2, GAME.height / 2 + 32, 'Press D to Deckbuild', {
        fontSize: '32px',
      })
      .setOrigin(0.5, 0);
  }

  update(): void {
    if (this.startKey?.isDown) {
      this.scene.start(SCENES.cards);
      this.scene.start(SCENES.hud);
      this.scene.start(SCENES.game);
      this.scene.bringToTop(SCENES.hud);
      this.scene.bringToTop(SCENES.cards);
    } else if (this.deckbuildKey?.isDown) {
      this.scene.start(SCENES.deckbuild);
    }
  }
}
