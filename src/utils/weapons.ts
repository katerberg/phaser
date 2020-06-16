import {COLORS} from '../constants';
import {WeaponName, ResourceType} from '../interfaces';

export function getCharges(weapon: WeaponName): number | undefined {
  switch (weapon) {
    case 'bullet':
      return 10;
    case 'laser':
      return 5;
    case 'arrow':
      return 99;
    default:
      return undefined;
  }
}

export function getDamageModifier(resource: ResourceType): number {
  switch (resource) {
    case 'iron':
      return 2;
    case 'poison':
      return 5;
    case 'wood':
      return 1;
    case 'energy':
      return 0;
    default:
      return 0;
  }
}

export function getColor(resource: ResourceType): number | undefined {
  switch (resource) {
    case 'iron':
      return COLORS.ORANGE;
    case 'poison':
      return COLORS.SEAFOAM;
    case 'wood':
      return COLORS.TAN;
    case 'energy':
      return COLORS.GRAY;
    default:
      return undefined;
  }
}
