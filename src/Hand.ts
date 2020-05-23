import {HandCard} from './HandCard';
import {Card} from './interfaces/Shared';
import {constants} from './utils/constants';

export class Hand {
  private displayCards: HandCard[];

  private scene: Phaser.Scene;

  private x: number;

  private y: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.displayCards = [];
    this.x = x;
    this.y = y;
    this.scene = scene;
  }

  public getCard(number: number): Card | undefined {
    return this.displayCards[number]?.getCard();
  }

  public removeCard(number: number): Card | undefined {
    const cards = this.displayCards.splice(number, 1);
    if (cards.length === 0) {
      return undefined;
    }
    const card = cards[0].getCard();
    cards[0].destroy();
    this.redraw();
    return card;
  }

  private redraw(): void {
    this.displayCards = this.displayCards.map((displayCard, i) => {
      const card = displayCard.getCard();
      displayCard.destroy();
      return new HandCard({scene: this.scene, x: this.x + i * (constants.game.cardWidth + 20), y: this.y}, card);
    });
    this.scene.registry.set('numberOfCardsInHand', this.displayCards.length);
  }

  public add(card: Card): void {
    const cardPosition = this.displayCards.length;
    this.displayCards.push(
      new HandCard({scene: this.scene, x: this.x + cardPosition * (constants.game.cardWidth + 20), y: this.y}, card),
    );
    this.scene.registry.set('numberOfCardsInHand', this.displayCards.length);
  }
}
