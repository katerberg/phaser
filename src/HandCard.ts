import * as Phaser from 'phaser';
import {ResourceType} from './interfaces/ResourceType';
import {Card} from './interfaces/Shared';
import {ResourceCard} from './ResourceCard';
import {constants} from './utils/constants';

export class HandCard extends Phaser.GameObjects.Image implements Card {
  public id: string;

  public cost: number;

  public benefit?: number;

  public resourceType?: ResourceType;

  constructor({scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string}, card: Card) {
    super(scene, x, y, key);
    this.id = card.id;
    this.cost = card.cost;
    if (card instanceof ResourceCard) {
      this.benefit = card.benefit;
      this.resourceType = card.resourceType;
    }

    this.setOrigin(1, 1);
    scene.add.existing(this);

    if (card instanceof ResourceCard) {
      const center = this.getCenter();
      scene.add
        .text(center.x, center.y, `${card.benefit}`, {
          fontSize: '72px',
        })
        .setOrigin(1, 0.5);
      scene.add.image(center.x, center.y, `resource-${card.resourceType}`).setOrigin(0, 0.6).setScale(0.05);
    }

    scene.add
      .text(x, y - 200, `${card.cost}${constants.symbols.energy}`, {
        fontSize: '32px',
      })
      .setOrigin(1, 1);
  }
}
