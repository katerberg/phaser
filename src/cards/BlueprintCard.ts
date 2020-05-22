import {v4 as uuid} from 'uuid';
import {WeaponType, Card} from '../interfaces';
import {ResourceCard} from './ResourceCard';

export class BlueprintCard implements Card {
  public id: string;

  public cost: number;

  public image: string;

  public weaponType: WeaponType;

  public buildTime: number;

  public resources: ResourceCard[];

  public resourceCost: number;

  constructor(cost: number, weaponType: WeaponType, buildTime: number, image: string, resourceCost: number) {
    this.id = uuid();
    this.cost = cost;
    this.image = image;
    this.weaponType = weaponType;
    this.buildTime = buildTime;
    this.resources = [];
    this.resourceCost = resourceCost;
  }
}
