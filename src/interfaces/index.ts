import {Projectile} from './Shared';

export {ProjectileType} from './ProjectileType';
export {ResourceType} from './ResourceType';
export {WeaponType} from './WeaponType';
export {WeaponName} from './WeaponName';
export {BlueprintImage} from './BlueprintImage';
export * from './Shared';

export function instanceOfProjectile(object: Phaser.GameObjects.GameObject): object is Projectile {
  return 'speed' in object && 'damage' in object && 'id' in object && 'projectileType' in object;
}
