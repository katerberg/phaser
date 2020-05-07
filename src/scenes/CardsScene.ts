import * as Phaser from 'phaser';
import anvilImage from '../assets/anvil.png';
import cardImage from '../assets/card.png';
import deckImage from '../assets/deck.png';
import {Card} from '../Card';
import {Deck} from '../Deck';
import {Hand} from '../Hand';
import {constants} from '../utils/constants';

export class CardsScene extends Phaser.Scene {
  hand!: Hand;

  deck!: Deck;

  constructor() {
    super({
      key: constants.scenes.cards,
    });
  }

  preload(): void {
    this.load.image('icon-anvil', anvilImage);
    this.load.image('icon-deck', deckImage);
    this.load.image('card', cardImage);
  }

  create(): void {
    this.hand = new Hand();
    this.deck = new Deck({scene: this, x: constants.game.width - 10, y: constants.game.height - 10, key: 'icon-deck'});
    this.add
      .image(8, constants.game.height - 10, 'icon-anvil')
      .setOrigin(0, 1)
      .setScale(0.55);

    Array(4)
      .fill('')
      .forEach(() => {
        this.hand.add(new Card());
      });
    Array(20)
      .fill('')
      .forEach(() => {
        this.deck.add(new Card());
      });

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
