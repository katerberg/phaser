import {ProjectileType, ServerProjectile, ProjectileOpts} from '../interfaces';
import {Projectile} from './Projectile';

export {Projectile} from './Projectile';

export function createProjectile(type: ProjectileType, opts: ProjectileOpts, id: string): Projectile {
  return new Projectile(opts, opts.angle, id, type, opts.speed);
}

export function getProjectile(projectile: ServerProjectile, scene: Phaser.Scene): Projectile {
  const opts = {
    x: projectile.x,
    y: projectile.y,
    scene,
    speed: projectile.speed,
    angle: projectile.angle,
    key: projectile.projectileType,
    damageAmount: projectile.damageAmount,
    damageOverTime: projectile.damageOverTime,
  };
  return createProjectile(projectile.projectileType, opts, projectile.id);
}
