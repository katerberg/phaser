import {v4 as uuid} from 'uuid';

export class Weapon {
  public id: string;

  public weaponImage: string;

  constructor(weaponImage: string) {
    this.id = uuid();
    this.weaponImage = weaponImage;
  }
}
