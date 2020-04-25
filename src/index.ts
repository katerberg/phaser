import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import * as io from 'socket.io-client';
import hitmanImage from './assets/images/hitman1_gun.png';
import {Player} from './Player';
import {Enemy} from './Enemy';
import soldierImage from './assets/Soldier 1/soldier1_gun.png';


interface ServerPlayer extends Phaser.Physics.Arcade.Sprite  {
  playerId: string;
}

class GameScene extends Phaser.Scene {

  public socket: SocketIOClient.Socket;
  player: Player;
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
    self.otherPlayers = this.physics.add.group({
      createCallback: p => {
        if (p && p.body instanceof Phaser.Physics.Arcade.Body) {
           p.body.setImmovable(true);
        }
      }
    });
    self.socket = io('http://127.0.0.1:8081');

    self.socket.on('currentPlayers', (players: {['string']: ServerPlayer}) => {
      Object.values(players).forEach((player: ServerPlayer) => {
        if (player.playerId === self.socket.id) {
          this.addPlayer(player);
        } else {
          this.addOtherPlayer(player);
        }
      });
      this.physics.add.collider(self.otherPlayers, self.player);

      self.socket.on('newPlayer', (playerInfo: ServerPlayer) => {
        this.addOtherPlayer(playerInfo);
      });

      self.socket.on('disconnect', (playerId: string) => {
        self.otherPlayers.getChildren().forEach((otherPlayer: Enemy) => {
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
    });
  }

  update(): void {
    if (this.player) {
      this.player.update();
    }
  }

  addPlayer(playerInfo: ServerPlayer): void {
    this.player = new Player({
      scene: this,
      x: playerInfo.x,
      y: playerInfo.y,
      key: 'hitman'},
    this.socket);
  }

  addOtherPlayer(playerInfo: ServerPlayer): void {
    const otherPlayer: Enemy = new Enemy({
      scene: this,
      x: playerInfo.x,
      y: playerInfo.y,
      key: 'soldier'
    }, playerInfo.playerId);
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
