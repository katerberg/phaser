import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import {GameScene} from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: {y: 0},
    },
  },
  scene: GameScene,
};

export class Game extends Phaser.Game {}

window.addEventListener('load', () => {
  new Game(config);
});
