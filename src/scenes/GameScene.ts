import * as Phaser from 'phaser';
import * as io from 'socket.io-client';
import * as tilemap from '../assets/grass-map.json';
import grassTileset from '../assets/grass-tileset.png';
import hitmanImage from '../assets/Hitman/hitman1_gun.png';
import soldierImage from '../assets/Soldier 1/soldier1_gun.png';
import bulletImage from '../assets/Tiles/tile_360.png';
import {Bullet} from '../Bullet';
import {Enemy} from '../Enemy';
import {ServerProjectile} from '../interfaces/Shared';
import {Player} from '../Player';
import {isDebug} from '../utils/environments';

interface ServerDamage {
  playerId: string;
  damage: number;
}

interface ServerPlayer {
  x: number;
  y: number;
  playerId: string;
  angle: number;
}

interface ServerProjectileDestroy {
  projectileId: string;
}

export class GameScene extends Phaser.Scene {
  public socket: SocketIOClient.Socket | undefined;

  player: Player | undefined;

  otherPlayers!: Phaser.Physics.Arcade.Group;

  constructor() {
    super({
      key: 'GameScene',
    });
  }

  preload(): void {
    this.load.image('hitman', hitmanImage);
    this.load.image('soldier', soldierImage);
    this.load.image('bullet', bulletImage);

    this.load.image('grass-tileset', grassTileset);
    this.load.tilemapTiledJSON('map', tilemap as any); //eslint-disable-line
  }

  create(): void {
    this.otherPlayers = this.physics.add.group({
      createCallback: (p) => {
        if (p && p.body instanceof Phaser.Physics.Arcade.Body) {
          p.body.setImmovable(true);
        }
      },
    });

    const map = this.make.tilemap({key: 'map'});
    const tileset = map.addTilesetImage('grass-tileset');
    map.createStaticLayer('GameScene', tileset);

    this.socket = io('http://127.0.0.1:8081');

    this.socket.on('currentPlayers', (players: {['string']: ServerPlayer}) => {
      if (!this.socket) {
        return;
      }
      Object.values(players).forEach((player: ServerPlayer) => {
        if (this.socket && player.playerId === this.socket.id) {
          if (isDebug()) {
            this.add.text(400 - 5 * 32, 300 - 32, player.playerId, {align: 'center', fontSize: '32px'});
          }
          this.addPlayer(player);
        } else {
          this.addOtherPlayer(player);
        }
      });
      if (!this.player) {
        return;
      }
      this.physics.add.collider(this.otherPlayers, this.player);

      this.socket.on('newPlayer', (playerInfo: ServerPlayer) => {
        this.addOtherPlayer(playerInfo);
      });

      this.socket.on('disconnect', (playerId: string) => {
        if (this.socket && this.player?.playerId === playerId) {
          this.socket.disconnect();
          delete this.player;
          this.scene.start('MenuScene');
        }
        this.otherPlayers.getChildren().forEach((otherPlayer) => {
          if (otherPlayer instanceof Enemy && playerId === otherPlayer.playerId) {
            otherPlayer.destroy();
          }
        });
      });

      this.socket.on('projectileFired', (projectileInfo: ServerProjectile) => {
        this.otherPlayers.getChildren().forEach((otherPlayer) => {
          if (otherPlayer instanceof Enemy) {
            if (otherPlayer.playerId === projectileInfo.playerId) {
              otherPlayer.addProjectile(projectileInfo);
            }
          }
        });
      });

      this.socket.on('projectileDestroyed', ({projectileId}: ServerProjectileDestroy) => {
        this.otherPlayers.getChildren().forEach((otherPlayer) => {
          if (otherPlayer instanceof Enemy) {
            otherPlayer
              .getProjectiles()
              .getChildren()
              .forEach((projectile) => {
                if (projectile instanceof Bullet && projectile.id === projectileId) {
                  projectile.destroy();
                }
              });
          }
        });
      });

      this.socket.on('playerMoved', (playerInfo: ServerPlayer) => {
        this.otherPlayers.getChildren().forEach((otherPlayer) => {
          if (otherPlayer instanceof Enemy && playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.setAngle(playerInfo.angle);
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
          }
        });
      });

      this.socket.on('playerDamaged', ({playerId, damage}: ServerDamage) => {
        if (this.player?.playerId === playerId) {
          this.player.handleDamage(damage);
        }
      });
    });
  }

  update(): void {
    if (this.player) {
      this.player.update();
      this.physics.overlap(this.player.getProjectiles(), this.otherPlayers, this.projectileHitEnemy, undefined, this);
    }
  }

  addPlayer(playerInfo: ServerPlayer): void {
    if (!this.socket) {
      return;
    }
    this.player = new Player(
      {
        scene: this,
        x: playerInfo.x,
        y: playerInfo.y,
        key: 'hitman',
      },
      playerInfo.playerId,
      this.socket,
    );
  }

  addOtherPlayer(playerInfo: ServerPlayer): void {
    const otherPlayer: Enemy = new Enemy(
      {
        scene: this,
        x: playerInfo.x,
        y: playerInfo.y,
        key: 'soldier',
      },
      playerInfo.playerId,
    );
    this.otherPlayers.add(otherPlayer);
  }

  projectileHitEnemy(projectile: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject): void {
    if (!this.socket || !(projectile instanceof Bullet && enemy instanceof Enemy)) {
      return;
    }
    this.socket.emit('projectileHit', {
      playerId: enemy.playerId,
      damage: projectile.damage,
      projectileId: projectile.id,
    });
    projectile.destroy();
  }
}
