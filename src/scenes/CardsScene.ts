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
import {Card} from '../interfaces';
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
    const gameLevel = this.scene.get(constants.scenes.game);
    gameLevel.events.on(constants.events.DRAW_CARD, this.drawCardFromDeckToHand, this);
    gameLevel.events.on(constants.events.PLAY_CARD, this.playCard, this);
    gameLevel.events.on(constants.events.PLAYER_DIED, this.handlePlayerDeath, this);
    this.events.on(constants.events.ADD_CARD_TO_DECK, this.addCardToDeck, this);
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

  addCardToDeck(card: Card): void {
    this.deck.add(card);
    this.deck.shuffle();
  }

  playCard(cardNumber: number): void {
    const card = this.hand.getCard(cardNumber);
    if (!card) {
      return;
    }
    const level = this.scene.get(constants.scenes.game);
    if (card instanceof BlueprintCard && level.registry.get('blueprintCount') !== constants.rules.maxBlueprints) {
      level.registry.set('blueprintPlayed', card);
      this.events.emit(constants.events.BLUEPRINT_PLAYED);
      this.hand.removeCard(cardNumber);
    }
    if (card instanceof ResourceCard) {
      this.events.emit(constants.events.RESOURCE_PLAYED, card);
      this.hand.removeCard(cardNumber);
    }
  }

  private handlePlayerDeath(): void {
    Object.values(constants.events).forEach((event) => {
      this.scene.scene.events.removeListener(event);
    });
  }
}
