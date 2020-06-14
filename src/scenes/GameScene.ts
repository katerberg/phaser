import * as Phaser from 'phaser';
import * as io from 'socket.io-client';
import soldierImage from '../assets/characters/enemy.png';
import hitmanImage from '../assets/characters/hitman.png';
import robotImage from '../assets/characters/robot.png';
import * as tilemap from '../assets/grass-map.json';
import grassTileset from '../assets/grass-tileset.png';
import arrowImage from '../assets/projectiles/arrow.png';
import bulletImage from '../assets/projectiles/bullet.png';
import laserImage from '../assets/projectiles/laser.png';
import rockImage from '../assets/structures/rock.png';
import {Bot} from '../Bot';
import {EVENTS, PLAY_AREA, SCENES, GAME} from '../constants';
import {Enemy} from '../Enemy';
import {
  ServerProjectile,
  ServerStructure,
  ServerBotDisconnect,
  ServerPlayer,
  ServerProjectileDestroy,
  ServerDamage,
  ServerBot,
  instanceOfImage,
  instanceOfProjectile,
} from '../interfaces';
import {Player} from '../Player';
import {Projectile} from '../projectiles';
import {Structure} from '../Structure';
import {isDebug} from '../utils/environments';

export class GameScene extends Phaser.Scene {
  public socket: SocketIOClient.Socket | undefined;

  player: Player | undefined;

  otherPlayers!: Phaser.Physics.Arcade.Group;

  structures!: Phaser.Physics.Arcade.Group;

  bots!: Phaser.Physics.Arcade.Group;

  constructor() {
    super({
      key: SCENES.game,
    });
  }

  preload(): void {
    this.load.image('hitman', hitmanImage);
    this.load.image('soldier', soldierImage);
    this.load.image('robot', robotImage);
    this.load.image('rock', rockImage);
    this.load.image('bullet', bulletImage);
    this.load.image('laser', laserImage);
    this.load.image('arrow', arrowImage);

    this.load.image('grass-tileset', grassTileset);
    this.load.tilemapTiledJSON('map', tilemap as any); //eslint-disable-line
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#FFFFFF');
    this.physics.world.setBounds(PLAY_AREA.xOffset, PLAY_AREA.yOffset, PLAY_AREA.width, PLAY_AREA.height);
    this.otherPlayers = this.physics.add.group({
      createCallback: (p) => {
        if (p?.body instanceof Phaser.Physics.Arcade.Body) {
          p.body.setImmovable(true);
        }
      },
    });

    this.structures = this.physics.add.group({
      createCallback: (p) => {
        if (p?.body instanceof Phaser.Physics.Arcade.Body) {
          p.body.setImmovable(true);
        }
      },
    });

    this.bots = this.physics.add.group({
      createCallback: (p) => {
        if (p?.body instanceof Phaser.Physics.Arcade.Body) {
          p.body.setImmovable(true);
        }
      },
    });

    this.buildPlayArea();
    this.socket = io('http://127.0.0.1:8081');

    this.socket.on('currentPlayers', this.handlePlayerList.bind(this));
    this.socket.on('currentBots', this.handleBotList.bind(this));
    this.socket.on('currentStructures', this.handleStructureList.bind(this));

    this.events.on(EVENTS.BOT_DESTROYED, this.handleBotDestroyed, this);
  }

  update(): void {
    if (this.player) {
      this.player.update();
      this.physics.overlap(
        this.player.getProjectiles(),
        this.structures,
        this.projectileHitStructure,
        this.testImageOverlap,
        this,
      );
      this.physics.overlap(this.player.getProjectiles(), this.otherPlayers, this.projectileHitEnemy, undefined, this);
      this.physics.overlap(this.player.getProjectiles(), this.bots, this.projectileHitEnemy, undefined, this);
      this.physics.overlap(
        this.player.getProjectiles(),
        this.player,
        this.projectileHitPlayer,
        this.testImageOverlap,
        this,
      );
    }
  }

  private handleStructureList(structureList: {['string']: ServerStructure}): void {
    Object.values(structureList).forEach((structure: ServerStructure) => {
      this.addStructure(structure.id, structure.x, structure.y, structure.type);
    });
  }

  private handleBotList(playerList: {['string']: {['string']: ServerBot}}): void {
    if (!this.socket) {
      return;
    }

    Object.values(playerList).forEach((botList: {['string']: ServerBot}) => {
      Object.values(botList).forEach((bot: ServerBot) => {
        this.addBot(bot);
      });
    });
  }

  private handlePlayerList(players: {['string']: ServerPlayer}): void {
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
    this.physics.add.collider(this.bots, this.player);
    this.physics.add.collider(this.structures, this.player);

    this.socket.on('newPlayer', (playerInfo: ServerPlayer) => {
      this.addOtherPlayer(playerInfo);
    });

    this.socket.on('newBot', (botInfo: ServerBot) => {
      this.addBot(botInfo);
    });

    this.socket.on('disconnect', this.handleDisconnect.bind(this));

    this.socket.on(EVENTS.PROJECTILE_FIRED, (projectileInfo: ServerProjectile) => {
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
              if (projectile instanceof Projectile && projectile.id === projectileId) {
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

    this.socket.on('botDamaged', ({botId, playerId, damage}: ServerDamage) => {
      if (this.player?.playerId === playerId) {
        this.bots.getChildren().forEach((bot) => {
          if (bot instanceof Bot && bot.botId === botId) {
            bot.handleDamage(damage);
          }
        });
      }
    });

    this.socket.on('botRemoved', this.handleBotRemoval.bind(this));
  }

  handleBotRemoval({botId}: ServerBotDisconnect): void {
    this.bots.getChildren().forEach((bot) => {
      if (bot instanceof Bot && botId === bot.botId) {
        bot.destroy();
      }
    });
  }

  handleDisconnect(playerId: string): void {
    if (this.socket && this.player?.playerId === playerId) {
      this.socket.disconnect();
      delete this.player;
      this.scene.start(SCENES.menu);
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
      this.add
        .text(GAME.width / 2, GAME.height / 2, this.player.playerId, {
          align: 'center',
          fontSize: '32px',
        })
        .setOrigin(0.5, 0.5);
    }
  }

  private addBot(botInfo: ServerBot): void {
    if (!this.socket || !this.player) {
      return;
    }
    const bot = new Bot(
      {
        scene: this,
        x: botInfo.x,
        y: botInfo.y,
        key: 'robot',
      },
      botInfo.playerId,
      botInfo.botId,
      this.player,
    );
    this.bots.add(bot);
  }

  private addStructure(id: string, x: number, y: number, type: string): void {
    const structure = new Structure(
      {
        scene: this,
        x,
        y,
        key: type,
      },
      id,
    );
    this.structures.add(structure);
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
    map.createStaticLayer('Tile Layer 1', tileset, PLAY_AREA.xOffset, PLAY_AREA.yOffset);
  }

  testImageOverlap(projectile: Phaser.GameObjects.GameObject, image: Phaser.GameObjects.GameObject): boolean {
    if (!this.socket || !instanceOfProjectile(projectile) || !instanceOfImage(image)) {
      return false;
    }
    const left = image.x - image.width / 2;
    const right = image.x + image.width / 2;
    const bottom = image.y - image.height / 2;
    const top = image.y + image.height / 2;
    const insideX = projectile.x > left && projectile.x < right;
    const insideY = projectile.y > bottom && projectile.y < top;
    return insideX && insideY;
  }

  projectileHitStructure(projectile: Phaser.GameObjects.GameObject, structure: Phaser.GameObjects.GameObject): void {
    if (!this.socket || !(instanceOfProjectile(projectile) && structure instanceof Structure)) {
      return;
    }
    this.socket.emit('projectileHit', {
      damage: projectile.damage,
      projectileId: projectile.id,
    });
    projectile.destroy();
  }

  projectileHitPlayer(projectile: Phaser.GameObjects.GameObject, player: Phaser.GameObjects.GameObject): void {
    if (!this.socket || !(instanceOfProjectile(projectile) && player instanceof Player)) {
      return;
    }
    this.socket.emit('projectileHit', {
      playerId: player.playerId,
      damage: projectile.damage,
      projectileId: projectile.id,
    });
    player.handleDamage(projectile.damage);
    projectile.destroy();
  }

  projectileHitEnemy(projectile: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject): void {
    if (!this.socket || !(instanceOfProjectile(projectile) && (enemy instanceof Enemy || enemy instanceof Bot))) {
      return;
    }
    this.socket.emit('projectileHit', {
      playerId: enemy.playerId,
      damage: projectile.damage,
      projectileId: projectile.id,
      botId: enemy instanceof Bot ? enemy.botId : undefined,
    });
    projectile.destroy();
  }

  private handleBotDestroyed({botId, playerId}: {botId: number; playerId: number}): void {
    if (this.socket) {
      this.socket.emit('destroyBot', {playerId, botId});
    }
  }
}
