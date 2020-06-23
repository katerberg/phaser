import * as Phaser from 'phaser';
import {SCENES} from '../constants';
import {DisplayCard} from '../DisplayCard';
import {Card} from '../interfaces';
import {getStartingDeck, saveDeck} from '../utils/starting';

export class Deck {
  private scene: Phaser.Scene;

  private resetKey: Phaser.Input.Keyboard.Key;

  private saveKey: Phaser.Input.Keyboard.Key;

  private nextAction!: number;

  private cards: Card[];

  private displayCards: DisplayCard[];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cards = [];

    this.resetKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.saveKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.nextAction = 0;
    this.cards = getStartingDeck();
    this.displayCards = this.cards.map((card) => new DisplayCard({scene, x: 300, y: 500}, card));
    Phaser.Actions.GridAlign(this.displayCards, {
      x: 200,
      y: 300,
      width: 5,
      height: 3,
      cellWidth: 185,
      cellHeight: 254,
    });
    this.displayCards.forEach((card) => card.realign());
  }

  private reset(): void {
    this.cards = getStartingDeck();
  }

  private save(): void {
    saveDeck(this.cards);
  }

  private handleReset(): void {
    if (this.resetKey.isDown && this.nextAction < this.scene.time.now) {
      this.reset();
      this.nextAction = this.scene.time.now + 500;
    }
  }

  private handleSave(): void {
    if (this.saveKey.isDown && this.nextAction < this.scene.time.now) {
      this.save();
      this.scene.scene.start(SCENES.menu);
      this.nextAction = this.scene.time.now + 500;
    }
  }

  public update(): void {
    this.handleReset();
    this.handleSave();
  }
}
