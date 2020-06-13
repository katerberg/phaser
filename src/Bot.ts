import * as Phaser from 'phaser';
import {v4 as uuid} from 'uuid';
import {EVENTS} from './constants';
import {Player} from './player';
import {getProjectile} from './projectiles';

export class Bot extends Phaser.GameObjects.Image {
  public playerId: string;

  public botId: string;

  public hp: number;

  private socket: SocketIOClient.Socket;

  private player: Player;

  private isOwned: boolean;

  constructor(
    {scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string},
    id: string,
    botId: string,
    socket: SocketIOClient.Socket,
    player: Player,
  ) {
    super(scene, x, y, key);

    this.setOrigin(0.5, 0.5).setDisplaySize(35, 43);
    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.playerId = id;
    this.botId = botId;
    this.socket = socket;
    this.hp = 10;
    this.player = player;
    this.isOwned = this.player.playerId === this.playerId;
    setTimeout(() => {
      this.botAct();
    }, 1000);
  }

  private botAct(): void {
    if (!this.scene || !this.isOwned) {
      return;
    }
    switch (Math.floor(Math.random() * 10)) {
      case 0:
        this.setAngle(90);
        break;
      case 1:
        this.setAngle(180);
        break;
      case 2:
        this.setAngle(270);
        break;
      case 3:
        this.setAngle(0);
        break;
      default:
        this.botProjectile();
    }

    setTimeout(() => {
      this.botAct();
    }, 1000);
  }

  private botProjectile(): void {
    const projectile = getProjectile(
      {
        id: uuid(),
        projectileType: 'laser',
        angle: this.angle,
        x: this.x,
        y: this.y,
        speed: 20,
        playerId: this.playerId,
      },
      this.scene,
    );

    this.player.addProjectile(projectile);
  }

  handleDamage(damage: number): void {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.scene.events.emit(EVENTS.BOT_DESTROYED, {botId: this.botId, playerId: this.playerId});
      this.isOwned = false;
      this.destroy();
    }
  }
}
