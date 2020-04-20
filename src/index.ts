import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import * as io from 'socket.io-client';
import hitmanImage from './assets/images/hitman1_gun.png';
import soldierImage from './assets/Soldier 1/soldier1_gun.png';


interface ServerPlayer {
  rotation: 0 | 90 | 180 | 270;
  x: number;
  y: number;
  playerId: string;
}

interface ClientPlayer {
  rotation: 0 | 90 | 180 | 270;
  x: number;
  y: number;
  playerId: string;
  destroy: () => void;
}

function preload(): void {
  this.load.image('hitman', hitmanImage);
  this.load.image('soldier', soldierImage);
}

function create(): void {
  const self = this;
  self.otherPlayers = this.physics.add.group();
  self.socket = io('http://127.0.0.1:8081');
  self.socket.on('currentPlayers', (players: {['string']: ServerPlayer}) => {
    console.log(JSON.stringify(players, null, 2));
    Object.values(players).forEach((player: ServerPlayer) => {
      if (player.playerId === self.socket.id) {
        addPlayer(self, player);
      } else {
        addOtherPlayer(self, player)
      }
    });

    self.socket.on('newPlayer', (playerInfo: ServerPlayer) => {
      addOtherPlayer(self, playerInfo);
    });

    self.socket.on('disconnect', function (playerId: string) {
      self.otherPlayers.getChildren().forEach((otherPlayer: ClientPlayer) => {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
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
  self.hitman = self.physics.add.image(playerInfo.x, playerInfo.y, 'hitman').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  self.hitman.setDrag(100);
  self.hitman.setAngularDrag(100);
  self.hitman.setMaxVelocity(200);
}

function addOtherPlayer(self: any, playerInfo: ServerPlayer) {
 const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'soldier').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
 otherPlayer.playerId = playerInfo.playerId;
 self.otherPlayers.add(otherPlayer);
}
