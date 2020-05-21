import {v4 as uuid} from 'uuid';
import {ResourceType, Card} from '../interfaces';

export class ResourceCard implements Card {
  public id: string;

  public cost: number;

  public benefit: number;

  public resourceType: ResourceType;

  constructor(cost: number, benefit: number, resourceType: ResourceType) {
    this.id = uuid();
    this.cost = cost;
    this.benefit = benefit;
    this.resourceType = resourceType;
  }
}
