import {ProjectileType} from './ProjectileType';

export interface ServerDamage {
  playerId: string;
  damageAmount: number;
  damageOverTime: number;
  botId?: string;
}

export interface ServerStructure {
  x: number;
  y: number;
  id: string;
  type: string;
}

export interface ServerPlayer {
  x: number;
  y: number;
  playerId: string;
  angle: number;
}

export interface ServerBot {
  x: number;
  y: number;
  playerId: string;
  botId: string;
  angle: number;
}

export interface ServerBotDisconnect {
  botId: string;
  playerId: string;
}

export interface ServerProjectile {
  id: string;
  x: number;
  y: number;
  damageAmount: number;
  damageOverTime: number;
  playerId: string;
  angle: number;
  speed: number;
  projectileType: ProjectileType;
}

export interface ServerProjectileDestroy {
  projectileId: string;
}
