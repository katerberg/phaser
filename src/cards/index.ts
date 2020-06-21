import {Card} from '../interfaces';
import {BlueprintCard} from './BlueprintCard';
import {ResourceCard} from './ResourceCard';

export {BlueprintCard} from './BlueprintCard';
export {ResourceCard} from './ResourceCard';

export function instanceOfCard(card: any): card is Card { // eslint-disable-line
  return 'id' in card && 'costToPlay' in card;
}

export function instanceOfBlueprint(card: Card): card is BlueprintCard {
  return (
    'id' in card &&
    'costToPlay' in card &&
    'costOfShot' in card &&
    'rechargeDelay' in card &&
    'image' in card &&
    'weaponType' in card &&
    'resources' in card &&
    'resourceCost' in card
  );
}

export function instanceOfResource(card: Card): card is ResourceCard {
  return 'id' in card && 'costToPlay' in card && 'benefit' in card && 'resourceType' in card;
}
