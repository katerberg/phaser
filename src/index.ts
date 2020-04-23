import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import * as io from 'socket.io-client';
import hitmanImage from './assets/images/hitman1_gun.png';
import soldierImage from './assets/Soldier 1/soldier1_gun.png';


interface ServerPlayer extends Phaser.Physics.Arcade.Sprite  {
  playerId: string;
}

class ClientPlayer extends Phaser.GameObjects.Sprite {
  playerId? : string;
}

interface PlayerCharacter extends Phaser.Physics.Arcade.Image {
  oldPosition?: {
    x: number;
    y: number;
    angle: number;
  };
}

class GameScene extends Phaser.Scene {

  public socket: SocketIOClient.Socket;
  public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: PlayerCharacter;
  otherPlayers: Phaser.Physics.Arcade.Group;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  preload(): void {
    this.load.image('hitman', hitmanImage);
    this.load.image('soldier', soldierImage);
  }

  create(): void {
    const self = this;
    self.otherPlayers = this.physics.add.group();
    self.socket = io('http://127.0.0.1:8081');
    self.socket.on('currentPlayers', (players: {['string']: ServerPlayer}) => {
      Object.values(players).forEach((player: ServerPlayer) => {
        if (player.playerId === self.socket.id) {
          addPlayer(self, player);
          this.physics.add.collider(self.otherPlayers, self.player, (other: ClientPlayer, player: ClientPlayer) => {
            console.log(other)
            console.log(player)
          });
        } else {
          addOtherPlayer(self, player);
        }
      });

      self.socket.on('newPlayer', (playerInfo: ServerPlayer) => {
        addOtherPlayer(self, playerInfo);
      });

      self.socket.on('disconnect', (playerId: string) => {
        self.otherPlayers.getChildren().forEach((otherPlayer: ClientPlayer) => {
          if (playerId === otherPlayer.playerId) {
            otherPlayer.destroy();
          }
        });
      });

      self.socket.on('playerMoved', (playerInfo: ServerPlayer) => {
        self.otherPlayers.getChildren().forEach((otherPlayer: ServerPlayer) => {
          if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.setAngle(playerInfo.angle);
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
          }
        });
      });

      self.cursors = this.input.keyboard.createCursorKeys();
    });
  }

  update(): void {
    if (this.player) {
      if (this.cursors.left.isDown) {
        this.player.setAngularVelocity(-250);
      } else if (this.cursors.right.isDown) {
        this.player.setAngularVelocity(250);
      } else {
        this.player.setAngularVelocity(0);
      }

      if (this.cursors.up.isDown && this.player.body instanceof Phaser.Physics.Arcade.Body) {
        this.physics.velocityFromAngle(this.player.angle + 1.5, 1000, this.player.body.acceleration);
      } else {
        this.player.setVelocity(0);
        this.player.setAcceleration(0);
      }


      this.physics.world.wrap(this.player, 5);

      const {x, y, angle} = this.player;
      if (x !== this.player.oldPosition?.x || y !== this.player.oldPosition?.y || angle !== this.player.oldPosition.angle) {
        this.socket.emit('playerMovement', {x: this.player.x, y: this.player.y, angle: this.player.angle});
      }

      this.player.oldPosition = {
        x: this.player.x,
        y: this.player.y,
        angle: this.player.angle,
      };
    }
  }
}

function addPlayer(self: GameScene, playerInfo: ServerPlayer): void {
  self.player = self.physics.add.image(playerInfo.x, playerInfo.y, 'hitman').setOrigin(0.5, 0.5).setDisplaySize(53, 40).setCollideWorldBounds(true);
  self.player.setAngle(90);
  self.player.setMaxVelocity(200);
}

function addOtherPlayer(self: GameScene, playerInfo: ServerPlayer): void {
  const otherPlayer: ClientPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'soldier').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}


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
  scene: GameScene
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.addEventListener("load", () => {
  new Game(config);
});
