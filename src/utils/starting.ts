import {BlueprintCard, ResourceCard} from '../cards';
import {Card} from '../interfaces';

export function getStartingDeck(): Card[] {
  const startingDeck: Card[] = [];
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(15, 1, 'poison'));
  startingDeck.push(new BlueprintCard(49, 'projectile', 'bullet', 2, 5, 300));
  startingDeck.push(new BlueprintCard(50, 'projectile', 'bullet', 2, 5, 300));
  startingDeck.push(new BlueprintCard(20, 'projectile', 'arrow', 1, 5, 100));
  startingDeck.push(new ResourceCard(15, 1, 'iron'));

  return startingDeck;
}
