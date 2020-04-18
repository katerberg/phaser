import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import * as io from 'socket.io-client';


function preload(): void {}

function create(): void {
}

function update(): void {}

const config = {
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
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

const socket = io('http://127.0.0.1:8081');
socket.on("currentPlayers", data => console.log(data));
