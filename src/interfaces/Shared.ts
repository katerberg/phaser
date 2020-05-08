import {ProjectileType} from './ProjectileType';
import {ResourceType} from './ResourceType';

export interface ServerProjectile {
  id: string;
  x: number;
  y: number;
  playerId: string;
  angle: number;
  speed: number;
  projectileType: ProjectileType;
}

export interface Card {
  id: string;
  cost: number;
  benefit: number;
  resourceType: ResourceType;
}

export interface Projectile extends Phaser.GameObjects.Image {
  speed: number;
  damage: number;
  id: string;
  projectileType: ProjectileType;
}
