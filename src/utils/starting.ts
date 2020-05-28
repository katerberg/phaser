import {BlueprintCard, ResourceCard} from '../cards';
import {Card} from '../interfaces';

export function getStartingDeck(): Card[] {
  const startingDeck: Card[] = [];
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(15, 1, 'poison'));
  startingDeck.push(new BlueprintCard(49, 'projectile', 10, 'bullet', 2));
  startingDeck.push(new BlueprintCard(50, 'projectile', 10, 'bullet', 2));
  startingDeck.push(new ResourceCard(15, 1, 'iron'));

  return startingDeck;
}
