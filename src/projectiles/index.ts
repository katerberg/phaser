import {ServerProjectile, Projectile} from '../interfaces/shared';
import {Arrow} from './Arrow';
import {Bullet} from './Bullet';

export {Arrow} from './Arrow';
export {Bullet} from './Bullet';

export function getProjectile(projectile: ServerProjectile, scene: Phaser.Scene): Projectile {
  switch (projectile.projectileType) {
    case 'bullet':
      return new Bullet(
        {
          x: projectile.x,
          y: projectile.y,
          scene,
          key: 'bullet',
        },
        projectile.angle,
        projectile.id,
      );
    case 'arrow':
      return new Arrow(
        {
          x: projectile.x,
          y: projectile.y,
          scene,
          key: 'arrow',
        },
        projectile.angle,
        projectile.id,
      );
    default:
      throw new Error();
  }
}
