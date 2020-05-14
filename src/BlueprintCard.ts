import {v4 as uuid} from 'uuid';
import {Card} from './interfaces/Shared';
import {WeaponType} from './interfaces/WeaponType';

export class BlueprintCard implements Card {
  public id: string;

  public cost: number;

  public image: string;

  public weaponType: WeaponType;

  public buildTime: number;

  constructor(cost: number, weaponType: WeaponType, buildTime: number, image: string) {
    this.id = uuid();
    this.cost = cost;
    this.image = image;
    this.weaponType = weaponType;
    this.buildTime = buildTime;
  }
}
