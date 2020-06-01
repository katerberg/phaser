import {v4 as uuid} from 'uuid';
import {WeaponName} from './interfaces';

export class Weapon {
  public id: string;

  public charges: number | undefined;

  public weaponImage: WeaponName;

  public costOfShot: number;

  public rechargeDelay: number;

  constructor(weaponImage: WeaponName, costOfShot: number, rechargeDelay: number, charges?: number) {
    this.id = uuid();
    this.weaponImage = weaponImage;
    this.charges = charges;
    this.costOfShot = costOfShot;
    this.rechargeDelay = rechargeDelay;
  }
}
