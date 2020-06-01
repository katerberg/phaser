import {v4 as uuid} from 'uuid';
import {ResourceType, Card} from '../interfaces';

export class ResourceCard implements Card {
  public id: string;

  public costToPlay: number;

  public benefit: number;

  public resourceType: ResourceType;

  constructor(costToPlay: number, benefit: number, resourceType: ResourceType) {
    this.id = uuid();
    this.costToPlay = costToPlay;
    this.benefit = benefit;
    this.resourceType = resourceType;
  }
}
