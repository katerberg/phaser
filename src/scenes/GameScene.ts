import * as Phaser from 'phaser';
import * as io from 'socket.io-client';
import {Player} from '../Player';
import {Bullet} from '../Bullet';
import {Enemy} from '../Enemy';
import hitmanImage from '../assets/Hitman/hitman1_gun.png';
import soldierImage from '../assets/Soldier 1/soldier1_gun.png';
import bulletImage from '../assets/Tiles/tile_360.png';

interface ServerPlayer {
  x: number;
  y: number;
  playerId: string;
  angle: number;
}

export class GameScene extends Phaser.Scene {

  public socket: SocketIOClient.Socket;
  player: Player;
  otherPlayers: Phaser.Physics.Arcade.Group;

  preload(): void {
    this.load.image('hitman', hitmanImage);
    this.load.image('soldier', soldierImage);
    this.load.image('bullet', bulletImage);
  }

  create(): void {
    this.otherPlayers = this.physics.add.group({
      createCallback: p => {
        if (p && p.body instanceof Phaser.Physics.Arcade.Body) {
          p.body.setImmovable(true);
        }
      },
    });
    this.socket = io('http://127.0.0.1:8081');

    this.socket.on('currentPlayers', (players: {['string']: ServerPlayer}) => {
      Object.values(players).forEach((player: ServerPlayer) => {
        if (player.playerId === this.socket.id) {
          this.addPlayer(player);
        } else {
          this.addOtherPlayer(player);
        }
      });
      this.physics.add.collider(this.otherPlayers, this.player);

      this.socket.on('newPlayer', (playerInfo: ServerPlayer) => {
        this.addOtherPlayer(playerInfo);
      });

      this.socket.on('disconnect', (playerId: string) => {
        if (this.player.playerId === playerId) {
          alert('you died');
        }
        this.otherPlayers.getChildren().forEach((otherPlayer: Enemy) => {
          if (playerId === otherPlayer.playerId) {
            otherPlayer.destroy();
          }
        });
      });

      this.socket.on('playerMoved', (playerInfo: ServerPlayer) => {
        this.otherPlayers.getChildren().forEach((otherPlayer: Enemy) => {
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
      this.physics.overlap(
        this.player.getProjectiles(),
        this.otherPlayers,
        this.projectileHitEnemy,
        null,
        this,
      );
    }
  }

  addPlayer(playerInfo: ServerPlayer): void {
    this.player = new Player({
      scene: this,
      x: playerInfo.x,
      y: playerInfo.y,
      key: 'hitman'},
    playerInfo.playerId,
    this.socket);
  }

  addOtherPlayer(playerInfo: ServerPlayer): void {
    const otherPlayer: Enemy = new Enemy({
      scene: this,
      x: playerInfo.x,
      y: playerInfo.y,
      key: 'soldier',
    }, playerInfo.playerId);
    this.otherPlayers.add(otherPlayer);
  }

  projectileHitEnemy(projectile: Bullet, enemy: Enemy): void {
    this.socket.emit('projectileHit', {playerId: enemy.playerId});
    projectile.destroy();
  }
}