import {v4 as uuid} from 'uuid';
import {DAMAGE} from './constants';
import {WeaponName, ResourceType, WeaponProjectileOpts} from './interfaces';
import {createProjectile, Projectile} from './projectiles';
import {getDamageModifier} from './utils/weapons';

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
    const damageAmount = this.resourceTypes.map(getDamageModifier).reduce((a, c) => a + c, DAMAGE[this.weaponImage]);
    const damageOverTime = 0 + this.resourceTypes.reduce((a, c) => a + (c === 'poison' ? 2 : 0), 0);
    return createProjectile(
      this.weaponImage,
      {x, y, angle, key: this.weaponImage, scene, damageAmount, damageOverTime},
      uuid(),
    );
  }
}
