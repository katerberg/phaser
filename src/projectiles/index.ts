import {ServerProjectile, Projectile} from '../interfaces/shared';
import {Bullet} from './Bullet';

export {Arrow} from './Arrow';
export {Bullet} from './Bullet';

export function getProjectile(projectile: ServerProjectile, scene: Phaser.Scene): Projectile {
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
}
