import {v4 as uuid} from 'uuid';
import {WeaponName} from './interfaces';

export class Weapon {
  public id: string;

  public weaponImage: WeaponName;

  constructor(weaponImage: WeaponName) {
    this.id = uuid();
    this.weaponImage = weaponImage;
  }
}
