import * as Phaser from 'phaser';
import {v4 as uuid} from 'uuid';
import {EVENTS} from './constants';
import {Enemy} from './Enemy';

export class Bot extends Enemy {
  public botId: string;

  public hp: number;

  private socket: SocketIOClient.Socket;

  private isOwned: boolean;

  constructor(
    {scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string},
    id: string,
    botId: string,
    socket: SocketIOClient.Socket,
    isOwned: boolean,
  ) {
    super({scene, x, y, key}, id);
    this.botId = botId;
    this.socket = socket;
    this.hp = 10;
    this.isOwned = isOwned;
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
    const projectile = this.addProjectile({
      id: uuid(),
      projectileType: 'laser',
      angle: this.angle,
      x: this.x,
      y: this.y,
      speed: 20,
      playerId: this.playerId,
    });

    this.socket.emit('projectileFiring', {
      x: projectile.x,
      y: projectile.y,
      angle: projectile.angle,
      speed: projectile.speed,
      projectileType: projectile.projectileType,
      id: projectile.id,
    });
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
