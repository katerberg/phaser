import {ResourceType} from '../ResourceType';

export interface ServerProjectile {
  id: string;
  x: number;
  y: number;
  playerId: string;
  angle: number;
  speed: number;
}

export interface Card {
  id: string;
  cost: number;
  benefit: number;
  resourceType: ResourceType;
}
