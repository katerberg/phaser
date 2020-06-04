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

  public createWeapon(): Weapon {
    return new Weapon({
      type: this.image,
      costOfShot: this.costOfShot,
      rechargeDelay: this.rechargeDelay,
      charges: getCharges(this.image),
      resourceTypes: this.resources.map((r) => r.resourceType),
    });
  }

  public reset(): void {
    this.resources = [];
  }
}
