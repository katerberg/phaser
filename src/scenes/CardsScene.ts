import * as Phaser from 'phaser';
import anvilImage from '../assets/anvil.png';
import cardDarkImage from '../assets/card-dark.png';
import cardLightImage from '../assets/card-light.png';
import deckImage from '../assets/deck.png';
import ironImage from '../assets/resources/iron.png';
import poisonImage from '../assets/resources/poison.png';
import waterImage from '../assets/resources/water.png';
import woodImage from '../assets/resources/wood.png';
import weaponBulletImage from '../assets/weapon-bullet.png';
import {ResourceCard, BlueprintCard} from '../cards';
import {Deck} from '../Deck';
import {Hand} from '../Hand';
import {constants} from '../utils/constants';
import {getStartingDeck} from '../utils/starting';

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
    this.load.image('resource-wood', woodImage);
    this.load.image('resource-water', waterImage);
    this.load.image('resource-iron', ironImage);
    this.load.image('resource-poison', poisonImage);
    this.load.image('card-bullet', weaponBulletImage);
    this.load.image('darkCard', cardDarkImage);
    this.load.image('lightCard', cardLightImage);
  }

  create(): void {
    this.hand = new Hand(this, 408, constants.game.height + 40);
    this.deck = new Deck({scene: this, x: constants.game.width - 10, y: constants.game.height - 10, key: 'icon-deck'});
    const level = this.scene.get(constants.scenes.game);
    level.events.on('drawCard', this.drawCardFromDeckToHand, this);
    level.events.on('playCard', this.playCard, this);
    this.add
      .image(8, constants.game.height - 10, 'icon-anvil')
      .setOrigin(0, 1)
      .setScale(0.55);

    getStartingDeck().forEach((card) => {
      this.deck.add(card);
    });
    this.deck.shuffle();

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

  playCard(cardNumber: number): void {
    const card = this.hand.removeCard(cardNumber);
    if (!card) {
      return;
    }
    if (card instanceof BlueprintCard) {
      const level = this.scene.get(constants.scenes.game);
      level.registry.set('blueprintPlayed', card);
      this.events.emit('blueprintPlayed');
    }
    if (card instanceof ResourceCard) {
      const level = this.scene.get(constants.scenes.game);
      level.registry.set('resourcePlayed', card);
      this.events.emit('resourcePlayed');
    }
  }
}
