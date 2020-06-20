import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import {GAME} from './constants';
import {GameScene, HudScene, DeckbuildScene, CardsScene, LoadingScene, MenuScene} from './scenes';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: GAME.width,
  height: GAME.height,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: {y: 0},
    },
  },
  scene: [LoadingScene, DeckbuildScene, CardsScene, MenuScene, GameScene, HudScene],
};

export class Game extends Phaser.Game {}

window.addEventListener('load', () => {
  new Game(config);
});
