import * as Phaser from 'phaser';
import anvilImage from '../assets/anvil.png';
import deckImage from '../assets/deck.png';
import {constants} from '../utils/constants';

export class CardsScene extends Phaser.Scene {
  constructor() {
    super({
      key: constants.scenes.cards,
    });
  }

  preload(): void {
    this.load.image('icon-anvil', anvilImage);
    this.load.image('icon-deck', deckImage);
  }

  create(): void {
    this.add
      .image(8, constants.game.height - 10, 'icon-anvil')
      .setOrigin(0, 1)
      .setScale(0.55);
    this.add
      .image(constants.game.width - 10, constants.game.height - 10, 'icon-deck')
      .setOrigin(1, 1)
      .setScale(0.55);
  }
}
