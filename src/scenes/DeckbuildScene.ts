import * as Phaser from 'phaser';
import cardDarkImage from '../assets/card-dark.png';
import cardLightImage from '../assets/card-light.png';
import ironImage from '../assets/resources/iron.png';
import poisonImage from '../assets/resources/poison.png';
import waterImage from '../assets/resources/water.png';
import woodImage from '../assets/resources/wood.png';
import weaponBulletImage from '../assets/weapon-bullet.png';
import weaponArrowImage from '../assets/weapon-dart.png';
import weaponLaserImage from '../assets/weapon-laser.png';
import {GAME, SCENES} from '../constants';
import {Deck} from '../deckbuilding/Deck';

export class DeckbuildScene extends Phaser.Scene {
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
    this.load.image('card-bullet', weaponBulletImage);
    this.load.image('card-arrow', weaponArrowImage);
    this.load.image('card-laser', weaponLaserImage);
  }

  create(): void {
    this.add
      .text(GAME.width / 2, 32, 'Press F to Finish', {
        fontSize: '32px',
      })
      .setOrigin(0.5, 0);
    this.deck = new Deck(this);
  }

  update(): void {
    this.deck.update();
  }
}
