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
import weaponArrowImage from '../assets/weapon-dart.png';
import {ResourceCard, BlueprintCard} from '../cards';
import {GAME, EVENTS, REGISTRIES, RULES, SCENES} from '../constants';
import {Deck} from '../Deck';
import {Hand} from '../Hand';
import {Card} from '../interfaces';
import {getStartingDeck} from '../utils/starting';

export class CardsScene extends Phaser.Scene {
  private hand!: Hand;

  private deck!: Deck;

  private nextPlayCard: number;

  private nextDraw!: number;

  private draw!: Phaser.Input.Keyboard.Key;

  private handInputs!: Phaser.Input.Keyboard.Key[];

  constructor() {
    super({
      key: SCENES.cards,
    });
    this.nextPlayCard = 0;
  }

  preload(): void {
    this.load.image('icon-anvil', anvilImage);
    this.load.image('icon-deck', deckImage);
    this.load.image('resource-wood', woodImage);
    this.load.image('resource-water', waterImage);
    this.load.image('resource-iron', ironImage);
    this.load.image('resource-poison', poisonImage);
    this.load.image('card-bullet', weaponBulletImage);
    this.load.image('card-arrow', weaponArrowImage);
    this.load.image('darkCard', cardDarkImage);
    this.load.image('lightCard', cardLightImage);
    const {KeyCodes} = Phaser.Input.Keyboard;
    this.handInputs = [
      this.scene.scene.input.keyboard.addKey(KeyCodes.A),
      this.scene.scene.input.keyboard.addKey(KeyCodes.S),
      this.scene.scene.input.keyboard.addKey(KeyCodes.D),
      this.scene.scene.input.keyboard.addKey(KeyCodes.F),
      this.scene.scene.input.keyboard.addKey(KeyCodes.G),
    ];
    this.draw = this.scene.scene.input.keyboard.addKey(KeyCodes.W);
    this.nextDraw = 0;
  }

  create(): void {
    this.hand = new Hand(this, 408, GAME.height + 40);
    this.deck = new Deck({scene: this, x: GAME.width - 10, y: GAME.height - 10, key: 'icon-deck'});
    const gameLevel = this.scene.get(SCENES.game);
    gameLevel.events.on(EVENTS.PLAYER_DIED, this.handlePlayerDeath, this);
    this.events.on(EVENTS.ADD_CARD_TO_DECK, this.addCardToDeck, this);
    this.events.on(EVENTS.PLAY_CARD, this.playCard, this);
    this.add
      .image(8, GAME.height - 10, 'icon-anvil')
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

  update(): void {
    this.handlePlayCard();
    this.handleDraw();
  }

  private handleDraw(): void {
    const energy = this.registry.get(REGISTRIES.PLAYER_ENERGY);
    if (
      this.draw.isDown &&
      this.nextDraw < this.scene.scene.time.now &&
      energy >= RULES.costOfDraw &&
      this.registry.get(REGISTRIES.HAND_CARDS_NUMBER) !== RULES.maxHand &&
      this.registry.get(REGISTRIES.DECK_CARDS_NUMBER) !== 0
    ) {
      const gameScene = this.scene.get(SCENES.game);
      this.drawCardFromDeckToHand();
      this.scene.scene.events.emit(EVENTS.DRAW_CARD);
      gameScene.events.emit(EVENTS.UPDATE_ENERGY, energy - RULES.costOfDraw);
      this.nextDraw = this.scene.scene.time.now + 200;
    }
  }

  private handlePlayCard(): void {
    const [one, two, three, four, five] = this.handInputs;
    if (
      this.nextPlayCard < this.scene.scene.time.now &&
      (one.isDown || two.isDown || three.isDown || four.isDown || five.isDown)
    ) {
      if (one.isDown) {
        this.scene.scene.events.emit(EVENTS.PLAY_CARD, 0);
      } else if (two.isDown) {
        this.scene.scene.events.emit(EVENTS.PLAY_CARD, 1);
      } else if (three.isDown) {
        this.scene.scene.events.emit(EVENTS.PLAY_CARD, 2);
      } else if (four.isDown) {
        this.scene.scene.events.emit(EVENTS.PLAY_CARD, 3);
      } else if (five.isDown) {
        this.scene.scene.events.emit(EVENTS.PLAY_CARD, 4);
      }
      this.nextPlayCard = this.scene.scene.time.now + 300;
    }
  }

  private drawCardFromDeckToHand(): void {
    const draw = this.deck.draw();
    if (draw) {
      this.hand.add(draw);
    }
  }

  private addCardToDeck(card: Card): void {
    this.deck.add(card);
    this.deck.shuffle();
  }

  private playCard(cardNumber: number): void {
    const card = this.hand.getCard(cardNumber);
    if (!card) {
      return;
    }
    const level = this.scene.get(SCENES.game);
    if (card instanceof BlueprintCard && level.registry.get(REGISTRIES.BLUEPRINTS_NUMBER) !== RULES.maxBlueprints) {
      this.events.emit(EVENTS.BLUEPRINT_PLAYED, card);
      this.hand.removeCard(cardNumber);
    }
    if (card instanceof ResourceCard) {
      this.events.emit(EVENTS.RESOURCE_PLAYED, card);
      this.hand.removeCard(cardNumber);
    }
  }

  private handlePlayerDeath(): void {
    Object.values(EVENTS).forEach((event) => {
      this.scene.scene.events.removeListener(event);
    });
  }
}
