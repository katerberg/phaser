import {DeckCard} from '../DeckCard';

export function getStartingDeck(): DeckCard[] {
  const startingDeck: DeckCard[] = [];
  startingDeck.push(new DeckCard(10, 1, 'wood'));
  startingDeck.push(new DeckCard(10, 1, 'wood'));
  startingDeck.push(new DeckCard(10, 1, 'wood'));
  startingDeck.push(new DeckCard(10, 1, 'wood'));
  startingDeck.push(new DeckCard(10, 1, 'iron'));

  return startingDeck;
}
