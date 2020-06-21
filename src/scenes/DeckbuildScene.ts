import * as Phaser from 'phaser';
import cardDarkImage from '../assets/card-dark.png';
import cardLightImage from '../assets/card-light.png';
import ironImage from '../assets/resources/iron.png';
import poisonImage from '../assets/resources/poison.png';
import waterImage from '../assets/resources/water.png';
import woodImage from '../assets/resources/wood.png';
import {GAME, SCENES} from '../constants';
import {Deck} from '../deckbuilding/Deck';

export class DeckbuildScene extends Phaser.Scene {
  private doneKey: Phaser.Input.Keyboard.Key | undefined;

  private deck!: Deck;

  constructor() {
    super({
      key: SCENES.deckbuild,
    });
  }

  preload(): void {
    this.load.image('darkCard', cardDarkImage);
    this.load.image('lightCard', cardLightImage);
    this.load.image('resource-wood', woodImage);
    this.load.image('resource-water', waterImage);
    this.load.image('resource-iron', ironImage);
    this.load.image('resource-poison', poisonImage);
    this.doneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
  }

  create(): void {
    this.add
      .text(GAME.width / 2, GAME.height / 2 + 32, 'Press F to Finish', {
        fontSize: '32px',
      })
      .setOrigin(0.5, 0);
    this.deck = new Deck(this);
  }

  update(): void {
    this.handleInput();
    this.deck.update();
  }

  private handleInput(): void {
    if (this.doneKey?.isDown) {
      this.scene.start(SCENES.menu);
    }
  }
}
