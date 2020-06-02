import {v4 as uuid} from 'uuid';
import {WeaponName} from './interfaces';

interface WeaponOptions {
  type: WeaponName;
  costOfShot: number;
  rechargeDelay: number;
  charges?: number;
}

export class Weapon {
  public id: string;

  public charges: number | undefined;

  public weaponImage: WeaponName;

  public costOfShot: number;

  public rechargeDelay: number;

  constructor(options: WeaponOptions) {
    this.id = uuid();
    this.weaponImage = options.type;
    this.charges = options.charges;
    this.costOfShot = options.costOfShot;
    this.rechargeDelay = options.rechargeDelay;
  }
}
