import * as Phaser from 'phaser';
import {REGISTRIES} from './constants';
import {Card} from './interfaces';

export class Deck extends Phaser.GameObjects.Image {
  private cards: Card[];

  private text: Phaser.GameObjects.Text;

  constructor({scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string}) {
    super(scene, x, y, key);
    this.cards = [];

    this.setOrigin(1, 1).setScale(0.55);
    scene.add.existing(this);
    const center = this.getCenter();
    this.text = this.scene.add
      .text(center.x, center.y, '0', {
        fontSize: '72px',
      })
      .setStroke('white', 5)
      .setColor('#888888')
      .setOrigin(0.5, 0.5);
  }

  public getCount(): number {
    return this.cards.length;
  }

  public draw(): Card | undefined {
    const card = this.cards.shift();
    this.scene.registry.set(REGISTRIES.DECK_CARDS_NUMBER, this.cards.length);
    this.updateText();
    return card;
  }

  public add(card: Card, bottom?: boolean): void {
    if (bottom) {
      this.cards.push(card);
    } else {
      this.cards.unshift(card);
    }
    this.scene.registry.set(REGISTRIES.DECK_CARDS_NUMBER, this.cards.length);
    this.updateText();
  }

  public shuffle(): void {
    // uses fisher-yates and is by someone smarter than me
    let currentIndex = this.cards.length;

    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      const temporaryValue = this.cards[currentIndex];
      this.cards[currentIndex] = this.cards[randomIndex];
      this.cards[randomIndex] = temporaryValue;
    }
  }

  private updateText(): void {
    this.text.setText(`${this.getCount()}`);
  }
}
