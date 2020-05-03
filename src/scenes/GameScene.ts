import * as Phaser from 'phaser';
import * as io from 'socket.io-client';
import * as tilemap from '../assets/grass-map.json';
import grassTileset from '../assets/grass-tileset.png';
import hitmanImage from '../assets/Hitman/hitman1_hold.png';
import bulletImage from '../assets/Tiles/tile_360.png';
import soldierImage from '../assets/Zombie 1/zoimbie1_hold.png';
import {Bullet} from '../Bullet';
import {Enemy} from '../Enemy';
import {ServerProjectile} from '../interfaces/Shared';
import {Player} from '../Player';
import {constants} from '../utils/constants';
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

  walls!: Phaser.Physics.Arcade.Group;

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
    this.physics.world.setBounds(
      constants.playArea.xOffset,
      constants.playArea.yOffset,
      constants.playArea.width,
      constants.playArea.height,
    );
    this.otherPlayers = this.physics.add.group({
      createCallback: (p) => {
        if (p && p.body instanceof Phaser.Physics.Arcade.Body) {
          p.body.setImmovable(true);
        }
      },
    });

    this.buildPlayArea();
    this.socket = io('http://127.0.0.1:8081');

    this.socket.on('currentPlayers', this.handlePlayerList.bind(this));
  }

  update(): void {
    if (this.player) {
      this.player.update();
      this.physics.overlap(this.player.getProjectiles(), this.otherPlayers, this.projectileHitEnemy, undefined, this);
    }
  }

  handlePlayerList(players: {['string']: ServerPlayer}): void {
    if (!this.socket) {
      return;
    }
    Object.values(players).forEach((player: ServerPlayer) => {
      if (player.playerId === this.socket?.id) {
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

    this.socket.on('disconnect', this.handleDisconnect.bind(this));

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
  }

  handleDisconnect(playerId: string): void {
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
    if (isDebug()) {
      this.add.text(400 - 5 * 32, 300 - 32, this.player.playerId, {align: 'center', fontSize: '32px'});
    }
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

  buildPlayArea(): void {
    const map = this.make.tilemap({key: 'map'});
    const tileset = map.addTilesetImage('grass-tileset');
    map.createStaticLayer('Tile Layer 1', tileset, constants.playArea.xOffset, constants.playArea.yOffset);
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
