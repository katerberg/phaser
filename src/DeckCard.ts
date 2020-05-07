import {v4 as uuid} from 'uuid';
import {Card} from './interfaces/Shared';
import {ResourceType} from './ResourceType';

export class DeckCard implements Card {
  public id: string;

  public cost: number;

  public benefit: number;

  public resourceType: ResourceType;

  constructor() {
    this.id = uuid();
    this.cost = Math.floor(Math.random() * 90) + 1;
    this.benefit = Math.floor(Math.random() * 9) + 1;
    this.resourceType = 'moon';
  }
}
