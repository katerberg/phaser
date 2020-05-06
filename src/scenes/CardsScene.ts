import * as Phaser from 'phaser';
import anvilImage from '../assets/anvil.png';
import cardImage from '../assets/card.png';
import deckImage from '../assets/deck.png';
import {Card} from '../Card';
import {Hand} from '../Hand';
import {constants} from '../utils/constants';

export class CardsScene extends Phaser.Scene {
  hand: Hand;

  constructor() {
    super({
      key: constants.scenes.cards,
    });
    this.hand = new Hand();
  }

  preload(): void {
    this.load.image('icon-anvil', anvilImage);
    this.load.image('icon-deck', deckImage);
    this.load.image('card', cardImage);
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

    this.hand.add(new Card());
    this.hand.add(new Card());
    this.hand.add(new Card());

    this.hand.getCards().forEach((card, i) => {
      const cardX = 408 + (i - 1) * (constants.game.cardWidth + 20);
      this.add.image(cardX, constants.game.height + 40, 'card').setOrigin(0, 1);
      this.add
        .text(
          cardX + constants.game.cardWidth / 2,
          constants.game.height - 100,
          `${card.benefit}${constants.symbols.moon}`,
          {
            fontSize: '72px',
          },
        )
        .setOrigin(0.5, 0);
      this.add
        .text(cardX + 169, constants.game.height - 200, `${card.cost}${constants.symbols.energy}`, {
          fontSize: '32px',
        })
        .setOrigin(1, 0);
    });
  }
}
