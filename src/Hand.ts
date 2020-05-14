import {HandCard} from './HandCard';
import {Card} from './interfaces/Shared';
import {constants} from './utils/constants';

export class Hand {
  private cards: Card[];

  private scene: Phaser.Scene;

  private x: number;

  private y: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.cards = [];
    this.x = x;
    this.y = y;
    this.scene = scene;
  }

  getCards(): Card[] {
    return this.cards;
  }

  add(card: Card): void {
    const cardPosition = this.cards.length;
    this.cards.push(
      new HandCard({scene: this.scene, x: this.x + cardPosition * (constants.game.cardWidth + 20), y: this.y}, card),
    );
  }
}
