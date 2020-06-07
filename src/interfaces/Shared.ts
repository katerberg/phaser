import {ProjectileType} from './ProjectileType';

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
  costToPlay: number;
}
