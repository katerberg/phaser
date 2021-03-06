import {GAME, REGISTRIES} from './constants';
import {DisplayCard} from './DisplayCard';
import {Card} from './interfaces';

export class Hand {
  private displayCards: DisplayCard[];

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
      return new DisplayCard({scene: this.scene, x: this.x + i * (GAME.cardWidth + 20), y: this.y}, card);
    });
    this.scene.registry.set(REGISTRIES.HAND_CARDS_NUMBER, this.displayCards.length);
  }

  public add(card: Card): void {
    const cardPosition = this.displayCards.length;
    this.displayCards.push(
      new DisplayCard({scene: this.scene, x: this.x + cardPosition * (GAME.cardWidth + 20), y: this.y}, card),
    );
    this.scene.registry.set(REGISTRIES.HAND_CARDS_NUMBER, this.displayCards.length);
  }
}
