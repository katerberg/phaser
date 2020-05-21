import {BlueprintCard, ResourceCard} from '../cards';
import {Card} from '../interfaces/Shared';

export function getStartingDeck(): Card[] {
  const startingDeck: Card[] = [];
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new BlueprintCard(50, 'projectile', 10, 'bullet', 2));
  startingDeck.push(new ResourceCard(10, 1, 'iron'));

  return startingDeck;
}
