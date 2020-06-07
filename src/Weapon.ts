import {v4 as uuid} from 'uuid';
import {WeaponName, ResourceType, WeaponProjectileOpts} from './interfaces';
import {createProjectile, Projectile} from './projectiles';

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
  }

  public createProjectile({x, y, angle, scene}: WeaponProjectileOpts): Projectile {
    return createProjectile(this.weaponImage, {x, y, angle, key: this.weaponImage, scene}, uuid());
  }
}
