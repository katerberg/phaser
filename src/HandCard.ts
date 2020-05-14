import * as Phaser from 'phaser';
import {BlueprintCard} from './BlueprintCard';
import {ResourceType} from './interfaces/ResourceType';
import {Card} from './interfaces/Shared';
import {ResourceCard} from './ResourceCard';
import {constants} from './utils/constants';

function getCardTexture(card: Card): string {
  return card instanceof ResourceCard ? 'darkCard' : 'lightCard';
}

export class HandCard extends Phaser.GameObjects.Image implements Card {
  public id: string;

  public cost: number;

  public benefit?: number;

  public resourceType?: ResourceType;

  constructor({scene, x, y}: {scene: Phaser.Scene; x: number; y: number}, card: Card) {
    super(scene, x, y, getCardTexture(card));
    this.id = card.id;
    this.cost = card.cost;
    if (card instanceof ResourceCard) {
      this.benefit = card.benefit;
      this.resourceType = card.resourceType;
    }

    this.setOrigin(1, 1);
    scene.add.existing(this);

    const center = this.getCenter();
    if (card instanceof ResourceCard) {
      scene.add
        .text(center.x, center.y, `${card.benefit}`, {
          fontSize: '72px',
        })
        .setOrigin(1, 0.5);
      scene.add.image(center.x, center.y, `resource-${card.resourceType}`).setOrigin(0, 0.6).setScale(0.05);
    }

    if (card instanceof BlueprintCard) {
      scene.add.image(center.x, center.y, `card-${card.image}`).setOrigin(0.5, 0.6).setScale(0.3);
    }

    scene.add
      .text(x, y - 200, `${card.cost}${constants.symbols.energy}`, {
        fontSize: '32px',
      })
      .setOrigin(1, 1);
  }
}
