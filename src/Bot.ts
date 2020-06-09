import * as Phaser from 'phaser';
import {v4 as uuid} from 'uuid';
import {EVENTS} from './constants';
import {Enemy} from './Enemy';

export class Bot extends Enemy {
  public botId: string;

  public hp: number;

  private socket: SocketIOClient.Socket;

  private shouldFire: boolean;

  constructor(
    {scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string},
    id: string,
    botId: string,
    socket: SocketIOClient.Socket,
  ) {
    super({scene, x, y, key}, id);
    this.botId = botId;
    this.socket = socket;
    this.hp = 10;
    this.shouldFire = true;
    setTimeout(() => {
      this.botProjectile();
    }, 1000);
  }

  botProjectile(): void {
    const projectile = this.addProjectile({
      id: uuid(),
      projectileType: 'arrow',
      angle: this.angle,
      x: this.x,
      y: this.y,
      speed: 200,
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

    setTimeout(() => {
      if (this.shouldFire) {
        this.botProjectile();
      }
    }, 1000);
  }

  handleDamage(damage: number): void {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.scene.events.emit(EVENTS.BOT_DESTROYED, {botId: this.botId, playerId: this.playerId});
      this.shouldFire = false;
      this.destroy();
    }
  }
}
