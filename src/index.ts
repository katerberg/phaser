import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import * as io from 'socket.io-client';
import hitmanImage from './assets/images/hitman1_gun.png';
import soldierImage from './assets/Soldier 1/soldier1_gun.png';


interface ServerPlayer {
  angle: number;
  x: number;
  y: number;
  playerId: string;
}

interface ClientPlayer {
  angle: number;
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
    self.cursors = this.input.keyboard.createCursorKeys();
  });
}

function update(): void {
  if (this.player) {
    if (this.cursors.left.isDown) {
      this.player.setAngularVelocity(-250);
    } else if (this.cursors.right.isDown) {
      this.player.setAngularVelocity(250);
    } else {
      this.player.setAngularVelocity(0);
    }

    if (this.cursors.up.isDown) {
      this.physics.velocityFromAngle(this.player.angle + 1.5, 1000, this.player.body.acceleration);
    } else {
      this.player.setVelocity(0);
      this.player.setAcceleration(0);
    }

    this.physics.world.wrap(this.player, 5);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: {y: 0}
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
  self.player = self.physics.add.image(playerInfo.x, playerInfo.y, 'hitman').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  self.player.setAngle(90)
  self.player.setMaxVelocity(200);
}

function addOtherPlayer(self: any, playerInfo: ServerPlayer) {
 const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'soldier').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
 otherPlayer.playerId = playerInfo.playerId;
 self.otherPlayers.add(otherPlayer);
}
