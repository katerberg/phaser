import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import * as io from 'socket.io-client';
import hitmanImage from './assets/images/hitman1_gun.png';
import soldierImage from './assets/Soldier 1/soldier1_gun.png';


interface ServerPlayer extends Phaser.Physics.Arcade.Sprite  {
  playerId: string;
}

class ClientPlayer extends Phaser.Physics.Arcade.Image {
  playerId? : string;
}

interface PlayerCharacter extends Phaser.Physics.Arcade.Image {
  oldPosition?: {
    x: number;
    y: number;
    angle: number;
  };
  getAngleFromSpeed?: (x:number, y:number) => number;
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
          this.addPlayer(player);
          this.physics.add.collider(self.otherPlayers, self.player, (other: ClientPlayer, player: ClientPlayer) => {
            console.log(other)
            console.log(player)
          });
        } else {
          this.addOtherPlayer(player);
        }
      });

      self.socket.on('newPlayer', (playerInfo: ServerPlayer) => {
        this.addOtherPlayer(playerInfo);
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
            otherPlayer.setImmovable();
            otherPlayer.setAngle(playerInfo.angle);
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
          }
        });
      });

      self.cursors = this.input.keyboard.createCursorKeys();
    });
  }

  update(): void {
    if (this.player && this.player.body instanceof Phaser.Physics.Arcade.Body) {
      const {up,down,left,right} = this.cursors;
      if (up.isDown || down.isDown || left.isDown || right.isDown) {
        let speed = 200;
        let keysCount = [up, down, right, left].reduce((prev, cur) => prev + (cur.isDown ? 1 : 0), 0);
        if (keysCount > 1) {
          speed /= Math.sqrt(2);
        }
        let xSpeed = 0;
        let ySpeed = 0;
        xSpeed -= left.isDown ? speed : 0;
        xSpeed += right.isDown ? speed : 0;
        ySpeed -= up.isDown ? speed : 0;
        ySpeed += down.isDown ? speed : 0;
        this.player.body.setVelocity(xSpeed,ySpeed)
        this.player.setAngle(this.player.getAngleFromSpeed(xSpeed, ySpeed))
      } else {
        this.player.setVelocity(0);
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

  addPlayer(playerInfo: ServerPlayer): void {
    this.player = this.physics.add.image(playerInfo.x, playerInfo.y, 'hitman').setOrigin(0.5, 0.5).setDisplaySize(53, 40).setCollideWorldBounds(true);
    this.player.setAngle(270); //Up
    this.player.getAngleFromSpeed = (x: number, y: number) => {
      const [north, south, west, east, northeast, southeast, southwest, northwest] = [270, 90, 180, 0, 315, 45, 135, 225];
      if (y > 0) {
        if (x > 0) {
          return southeast;
        } else if (x < 0) {
          return southwest;
        } else {
          return south;
        }
      } else if (y < 0) {
        if (x > 0) {
          return northeast;
        } else if (x < 0){
          return northwest;
        } else {
          return north;
        }
      } else {
        if (x > 0) {
          return east;
        } else if (x < 0){
          return west;
        } else {
          return north;
        }
      }
    }
  }

  addOtherPlayer(playerInfo: ServerPlayer): void {
    const otherPlayer: ClientPlayer = this.physics.add.image(playerInfo.x, playerInfo.y, 'soldier').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    otherPlayer.setImmovable();
    otherPlayer.playerId = playerInfo.playerId;
    this.otherPlayers.add(otherPlayer);
  }
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
