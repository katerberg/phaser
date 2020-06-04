import {v4 as uuid} from 'uuid';
import {WeaponName, ResourceType} from './interfaces';

interface WeaponOptions {
  type: WeaponName;
  costOfShot: number;
  rechargeDelay: number;
  charges?: number;
  resourceTypes?: ResourceType[];
}

export class Weapon {
  public id: string;

  public charges: number | undefined;

  public weaponImage: WeaponName;

  public costOfShot: number;

  public rechargeDelay: number;

  public resourceTypes: ResourceType[];

  constructor(options: WeaponOptions) {
    this.id = uuid();
    this.weaponImage = options.type;
    this.charges = options.charges;
    this.costOfShot = options.costOfShot;
    this.rechargeDelay = options.rechargeDelay;
    this.resourceTypes = options.resourceTypes || ['energy'];
    console.log(this.resourceTypes);
    console.log(options.resourceTypes);
  }
}
