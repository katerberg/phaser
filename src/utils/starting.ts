import {BlueprintCard} from '../BlueprintCard';
import {Card} from '../interfaces/Shared';
import {ResourceCard} from '../ResourceCard';

export function getStartingDeck(): Card[] {
  const startingDeck: Card[] = [];
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new BlueprintCard(50, 'projectile', 10, 'bullet'));
  startingDeck.push(new ResourceCard(10, 1, 'iron'));

  return startingDeck;
}
