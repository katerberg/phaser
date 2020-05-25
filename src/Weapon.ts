import {v4 as uuid} from 'uuid';
import {WeaponName} from './interfaces';

export class Weapon {
  public id: string;

  public charges: number | undefined;

  public weaponImage: WeaponName;

  constructor(weaponImage: WeaponName, charges?: number) {
    this.id = uuid();
    this.weaponImage = weaponImage;
    this.charges = charges;
  }
}
