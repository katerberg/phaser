import * as Phaser from 'phaser';
import {Card} from './interfaces/Shared';
import {ResourceType} from './ResourceType';
import {constants} from './utils/constants';

export class HandCard extends Phaser.GameObjects.Image implements Card {
  public id: string;

  public cost: number;

  public benefit: number;

  public resourceType: ResourceType;

  constructor({scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string}, card: Card) {
    super(scene, x, y, key);
    this.id = card.id;
    this.cost = card.cost;
    this.benefit = card.benefit;
    this.resourceType = card.resourceType;

    this.setOrigin(1, 1);
    scene.add.existing(this);
    const center = this.getCenter();
    scene.add
      .text(center.x, center.y, `${this.benefit}${constants.symbols.moon}`, {
        fontSize: '72px',
      })
      .setOrigin(0.5, 0.5);

    scene.add
      .text(x, y - 200, `${card.cost}${constants.symbols.energy}`, {
        fontSize: '32px',
      })
      .setOrigin(1, 1);
  }
}
