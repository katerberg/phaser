import {v4 as uuid} from 'uuid';
import {WeaponName, ResourceType, Projectile} from './interfaces';
import {Arrow, Bullet, Laser} from './projectiles';

interface WeaponOptions {
  type: WeaponName;
  costOfShot: number;
  rechargeDelay: number;
  charges?: number;
  resourceTypes?: ResourceType[];
}
interface ProjectileOpts {
  x: number;
  y: number;
  angle: number;
  scene: Phaser.Scene;
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

  public createProjectile({x, y, angle, scene}: ProjectileOpts): Projectile {
    const opts = {x, y, angle, scene};
    switch (this.weaponImage) {
      case 'arrow':
        return new Arrow({...opts, key: 'arrow'}, angle, uuid());
      case 'bullet':
        return new Bullet({...opts, key: 'bullet'}, angle, uuid());
      case 'laser':
        return new Laser({...opts, key: 'laser'}, angle, uuid());
      default:
        throw new Error();
    }
  }
}
