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
    shouldFire: boolean,
  ) {
    super({scene, x, y, key}, id);
    this.botId = botId;
    this.socket = socket;
    this.hp = 10;
    this.shouldFire = shouldFire;
    setTimeout(() => {
      this.botProjectile();
    }, 1000);
  }

  botProjectile(): void {
    if (!this.scene || !this.shouldFire) {
      return;
    }
    const projectile = this.addProjectile({
      id: uuid(),
      projectileType: 'bullet',
      angle: this.angle,
      x: this.x,
      y: this.y,
      speed: 20,
      playerId: this.playerId,
    });

    console.log(this.angle);
    console.log(projectile.angle);
    this.socket.emit('projectileFiring', {
      x: projectile.x,
      y: projectile.y,
      angle: projectile.angle,
      speed: projectile.speed,
      projectileType: projectile.projectileType,
      id: projectile.id,
    });

    setTimeout(() => {
      this.botProjectile();
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
