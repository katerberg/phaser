import * as Phaser from 'phaser';
import anvilImage from '../assets/anvil.png';
import cardImage from '../assets/card.png';
import deckImage from '../assets/deck.png';
import {Deck} from '../Deck';
import {DeckCard} from '../DeckCard';
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
    this.hand = new Hand(this, 408, constants.game.height + 40);
    this.deck = new Deck({scene: this, x: constants.game.width - 10, y: constants.game.height - 10, key: 'icon-deck'});
    const level = this.scene.get(constants.scenes.game);
    level.events.on('drawCard', this.drawCardFromDeckToHand, this);
    this.add
      .image(8, constants.game.height - 10, 'icon-anvil')
      .setOrigin(0, 1)
      .setScale(0.55);
    Array(20)
      .fill('')
      .forEach(() => {
        this.deck.add(new DeckCard());
      });

    Array(2)
      .fill('')
      .forEach(() => {
        this.drawCardFromDeckToHand();
      });
  }

  drawCardFromDeckToHand(): void {
    const draw = this.deck.draw();
    if (draw) {
      this.hand.add(draw);
    }
  }
}
