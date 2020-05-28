import {v4 as uuid} from 'uuid';
import {WeaponType, WeaponName, Card} from '../interfaces';
import {getCharges} from '../utils/weapons';
import {Weapon} from '../Weapon';
import {ResourceCard} from './ResourceCard';

export class BlueprintCard implements Card {
  public id: string;

  public cost: number;

  public image: WeaponName;

  public weaponType: WeaponType;

  public buildTime: number;

  public resources!: ResourceCard[];

  public resourceCost: number;

  public weapon!: Weapon;

  constructor(cost: number, weaponType: WeaponType, buildTime: number, image: WeaponName, resourceCost: number) {
    this.id = uuid();
    this.cost = cost;
    this.image = image;
    this.weaponType = weaponType;
    this.buildTime = buildTime;
    this.resourceCost = resourceCost;
    this.reset();
  }

  reset(): void {
    this.resources = [];
    this.weapon = new Weapon(this.image, getCharges(this.image));
  }
}
