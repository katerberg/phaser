import {ResourceCard} from '../ResourceCard';

export function getStartingDeck(): ResourceCard[] {
  const startingDeck: ResourceCard[] = [];
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'wood'));
  startingDeck.push(new ResourceCard(10, 1, 'iron'));

  return startingDeck;
}
