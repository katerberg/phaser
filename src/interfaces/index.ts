import {Projectile} from '../projectiles/Projectile';

export {ProjectileType} from './ProjectileType';
export {ProjectileOpts, WeaponProjectileOpts} from './ProjectileOpts';
export {ResourceType} from './ResourceType';
export {WeaponType} from './WeaponType';
export {WeaponName} from './WeaponName';
export {BlueprintImage} from './BlueprintImage';
export {Card} from './Card';
export * from './Server';

export function instanceOfProjectile(object: Phaser.GameObjects.GameObject): object is Projectile {
  return (
    'speed' in object &&
    'damageAmount' in object &&
    'damageOverTime' in object &&
    'id' in object &&
    'projectileType' in object
  );
}

export function instanceOfImage(object: Phaser.GameObjects.GameObject): object is Phaser.GameObjects.Image {
  return 'width' in object && 'height' in object && 'x' in object && 'y' in object;
}
