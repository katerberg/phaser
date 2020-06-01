import {WeaponName} from '../interfaces';

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
