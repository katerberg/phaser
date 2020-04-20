import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import * as io from 'socket.io-client';
import hitmanImage from './assets/images/hitman1_gun.png';


interface ServerPlayer {
  rotation: 0 | 90 | 180 | 270;
  x: number;
  y: number;
  playerId: string;
  team: 'red' | 'blue';
}

function preload(): void {
  console.log('preloading');
  this.load.image('hitman', hitmanImage);
  console.log(this);
  console.log('loaded');
}

function create(): void {
  const self = this;
  console.log('loaded assets');
  const socket = io('http://127.0.0.1:8081');
  socket.on('currentPlayers', (players: {['string']: ServerPlayer}) => {
    console.log(JSON.stringify(players, null, 2));
    Object.values(players).forEach((player: ServerPlayer) => {
      if (player.playerId === socket.id) {
        addPlayer(self, player);
      }
    });
  });
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

function addPlayer(self: any, playerInfo: ServerPlayer) {
  console.log('adding character');
  console.log(playerInfo)
  self.physics.add.image(playerInfo.x, playerInfo.y, 'hitman').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  self.hitman.setDrag(100);
  self.hitman.setAngularDrag(100);
  self.hitman.setMaxVelocity(200);
}
