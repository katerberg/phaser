import {BlueprintCard, ResourceCard, instanceOfCard, instanceOfResource, instanceOfBlueprint} from '../cards';
import {Card} from '../interfaces';

function getDefaultStartingDeck(): Card[] {
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

export function getStartingDeck(): Card[] {
  const storedDeck = localStorage.getItem('deck');
  try {
    if (!storedDeck) {
      return getDefaultStartingDeck();
    }
    return JSON.parse(storedDeck).filter((card:any) => { // eslint-disable-line
        return instanceOfCard(card);
      })
      .map((card: Card) => {
        if (instanceOfResource(card)) {
          return new ResourceCard(card.costToPlay, card.benefit, card.resourceType);
        }
        if (instanceOfBlueprint(card)) {
          return new BlueprintCard(
            card.costToPlay,
            card.weaponType,
            card.image,
            card.resourceCost,
            card.costOfShot,
            card.rechargeDelay,
          );
        }
        return card;
      });
  } catch (e) {
    return getDefaultStartingDeck();
  }
}

export function saveDeck(deck: Card[]): void {
  localStorage.setItem('deck', JSON.stringify(deck));
}
