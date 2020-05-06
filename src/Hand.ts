import {Card} from './Card';

export class Hand {
  private cards: Card[];

  constructor() {
    this.cards = [];
  }

  getCards(): Card[] {
    return this.cards;
  }

  add(card: Card): void {
    this.cards.push(card);
  }
}
