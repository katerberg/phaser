import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import {GameScene} from './scenes/GameScene';
import {HudScene} from './scenes/HudScene';
import {MenuScene} from './scenes/MenuScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1088,
  height: 640,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: {y: 0},
    },
  },
  scene: [MenuScene, GameScene, HudScene],
};

export class Game extends Phaser.Game {}

window.addEventListener('load', () => {
  new Game(config);
});
