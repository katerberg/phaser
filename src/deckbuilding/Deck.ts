import * as Phaser from 'phaser';
import {ResourceCard} from '../cards';
import {SCENES} from '../constants';
import {DisplayCard} from '../DisplayCard';
import {Card} from '../interfaces';
import {getStartingDeck, saveDeck} from '../utils/starting';

function getCard(scene: Phaser.Scene): DisplayCard {
  const resource = new ResourceCard(10, 1, 'wood');
  return new DisplayCard({scene, x: 0, y: 0}, resource);
}

export class Deck {
  private scene: Phaser.Scene;

  private resetKey: Phaser.Input.Keyboard.Key;

  private saveKey: Phaser.Input.Keyboard.Key;

  private nextAction!: number;

  private cards: Card[];

  private displayCards: DisplayCard[];

  private collection: DisplayCard[];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cards = [];
    this.displayCards = [];
    this.collection = [];

    this.resetKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.saveKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.nextAction = 0;
    this.drawCollection();
    this.reset();
    this.scene.input.on('gameobjectdown', this.onCardClicked, this);
  }

  private onCardClicked(_pointer: unknown, clickedCard: DisplayCard): void {
    if (this.collection.some((collectionCard) => collectionCard.id === clickedCard.id)) {
      this.onCollectionCardClicked(clickedCard);
    } else {
      this.onDeckCardClicked(clickedCard);
    }
  }

  private onCollectionCardClicked(clickedCard: DisplayCard): void {
    const index = this.collection.findIndex((collectionCard) => collectionCard.id === clickedCard.id);
    this.displayCards.push(this.collection[index]);
    this.cards.push(this.collection[index].getCard());
    const card = getCard(this.scene);
    this.collection[index] = card;
    card.setInteractive();
    this.realign();
  }

  private onDeckCardClicked(clickedCard: DisplayCard): void {
    clickedCard.destroy();
    this.cards = this.cards.filter((card) => clickedCard.id !== card.id);
    this.displayCards = this.displayCards.filter((card) => clickedCard.id !== card.id);
    this.realign();
  }

  private drawCollection(): void {
    this.collection.push(getCard(this.scene));
    this.collection.push(getCard(this.scene));
    this.collection.push(getCard(this.scene));
    this.collection.forEach((card) => {
      card.setInteractive();
    });
    this.realign();
  }

  private realign(): void {
    Phaser.Actions.GridAlign(this.displayCards, {
      x: 100,
      y: 200,
      width: 5,
      height: 3,
      cellWidth: 185,
      cellHeight: 254,
    });
    Phaser.Actions.GridAlign(this.collection, {
      x: 1100,
      y: 200,
      width: 2,
      height: 3,
      cellWidth: 185,
      cellHeight: 254,
    });
    this.displayCards.forEach((card) => card.realign());
    this.collection.forEach((card) => card.realign());
  }

  private reset(): void {
    this.cards = getStartingDeck();
    this.displayCards.forEach((card) => {
      card.destroy();
    });
    this.displayCards = this.cards.map((card) => new DisplayCard({scene: this.scene, x: 300, y: 500}, card));
    this.realign();
    this.displayCards.forEach((card) => {
      card.setInteractive();
    });
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
