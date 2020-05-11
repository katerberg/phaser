import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import {GameScene, HudScene, CardsScene, LoadingScene, MenuScene} from './scenes';
import '../node_modules/@fortawesome/fontawesome-free/css/all.css';
import {constants} from './utils/constants';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: constants.game.width,
  height: constants.game.height,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: {y: 0},
    },
  },
  scene: [LoadingScene, CardsScene, MenuScene, GameScene, HudScene],
};

export class Game extends Phaser.Game {}

window.addEventListener('load', () => {
  new Game(config);
});
