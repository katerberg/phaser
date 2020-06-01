import * as Phaser from 'phaser';
import {BlueprintCard, ResourceCard} from './cards';
import {SYMBOLS} from './constants';
import {Card} from './interfaces';

function getCardTexture(card: Card): string {
  return card instanceof ResourceCard ? 'darkCard' : 'lightCard';
}

export class HandCard extends Phaser.GameObjects.Image {
  public id: string;

  public costToPlay: number;

  private card: Card;

  private benefitText: Phaser.GameObjects.Text | undefined;

  private energyText: Phaser.GameObjects.Text;

  private image: Phaser.GameObjects.Image | undefined;

  constructor({scene, x, y}: {scene: Phaser.Scene; x: number; y: number}, card: Card) {
    super(scene, x, y, getCardTexture(card));
    this.id = card.id;
    this.costToPlay = card.costToPlay;
    this.card = card;

    this.setOrigin(1, 1);
    scene.add.existing(this);

    const center = this.getCenter();
    if (this.card instanceof ResourceCard) {
      this.benefitText = this.scene.add
        .text(center.x, center.y, `${this.card.benefit}`, {
          fontSize: '72px',
        })
        .setOrigin(1, 0.5);
      this.image = this.scene.add
        .image(center.x, center.y, `resource-${this.card.resourceType}`)
        .setOrigin(0, 0.6)
        .setScale(0.05);
    }

    if (this.card instanceof BlueprintCard) {
      this.image = this.scene.add
        .image(center.x, center.y, `card-${this.card.image}`)
        .setOrigin(0.5, 0.6)
        .setScale(0.3);
    }

    this.energyText = this.scene.add
      .text(this.x - 8, this.y - 200, `${this.card.costToPlay}${SYMBOLS.energy}`, {
        fontSize: '32px',
      })
      .setOrigin(1, 1);
  }

  public getCard(): Card {
    return this.card;
  }

  public destroy(): void {
    super.destroy();
    this.energyText.destroy();
    if (this.image) {
      this.image.destroy();
    }
    if (this.benefitText) {
      this.benefitText.destroy();
    }
  }
}
