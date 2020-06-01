import {v4 as uuid} from 'uuid';
import {WeaponType, WeaponName, Card} from '../interfaces';
import {getCharges} from '../utils/weapons';
import {Weapon} from '../Weapon';
import {ResourceCard} from './ResourceCard';

export class BlueprintCard implements Card {
  public id: string;

  public costToPlay: number;

  public costOfShot: number;

  public rechargeDelay: number;

  public image: WeaponName;

  public weaponType: WeaponType;

  public resources!: ResourceCard[];

  public resourceCost: number;

  public weapon!: Weapon;

  constructor(
    costToPlay: number,
    weaponType: WeaponType,
    image: WeaponName,
    resourceCost: number,
    costOfShot: number,
    rechargeDelay: number,
  ) {
    this.id = uuid();
    this.costToPlay = costToPlay;
    this.image = image;
    this.weaponType = weaponType;
    this.resourceCost = resourceCost;
    this.costOfShot = costOfShot;
    this.rechargeDelay = rechargeDelay;
    this.reset();
  }

  reset(): void {
    this.resources = [];
    this.weapon = new Weapon(this.image, this.costOfShot, this.rechargeDelay, getCharges(this.image));
  }
}
