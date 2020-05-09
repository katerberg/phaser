import {ServerProjectile, Projectile} from '../interfaces/shared';
import {Arrow} from './Arrow';
import {Bullet} from './Bullet';
import {Laser} from './Laser';

export {Arrow} from './Arrow';
export {Bullet} from './Bullet';
export {Laser} from './Laser';

export function getProjectile(projectile: ServerProjectile, scene: Phaser.Scene): Projectile {
  const opts = {x: projectile.x, y: projectile.y, scene};
  switch (projectile.projectileType) {
    case 'bullet':
      return new Bullet(
        {
          ...opts,
          key: 'bullet',
        },
        projectile.angle,
        projectile.id,
      );
    case 'laser':
      return new Laser(
        {
          ...opts,
          key: 'laser',
        },
        projectile.angle,
        projectile.id,
      );
    case 'arrow':
      return new Arrow(
        {
          ...opts,
          key: 'arrow',
        },
        projectile.angle,
        projectile.id,
      );
    default:
      throw new Error();
  }
}
