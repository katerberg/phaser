import * as Phaser from 'phaser';
import {v4 as uuid} from 'uuid';
import {EVENTS, DAMAGE, SPEED} from './constants';
import {Player} from './player';
import {getProjectile} from './projectiles';
import {getBotVelocity, getProjectileStartPosition} from './utils/trig';

export class Bot extends Phaser.GameObjects.Image {
  public body!: Phaser.Physics.Arcade.Body; // handled by world.enable

  public playerId: string;

  public botId: string;

  public hp: number;

  private player: Player;

  private isOwned: boolean;

  constructor(
    {scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string},
    id: string,
    botId: string,
    player: Player,
  ) {
    super(scene, x, y, key);

    this.setOrigin(0.5, 0.5).setDisplaySize(35, 43);
    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    scene.add.existing(this);

    this.playerId = id;
    this.botId = botId;
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
    const angle = 45 * Math.floor(Math.random() * 8);
    switch (Math.floor(Math.random() * 10)) {
      case 0:
      case 1:
      case 2:
      case 3:
        this.setAngle(angle);
        break;
      default:
        this.botProjectile();
    }
    const {x, y} = getBotVelocity(this.angle, SPEED.bot);
    this.body.setVelocity(x, y);

    setTimeout(() => {
      this.botAct();
    }, 1000);
  }

  private botProjectile(): void {
    const {x, y} = getProjectileStartPosition(this.x, this.y, this.angle);
    const projectile = getProjectile(
      {
        id: uuid(),
        projectileType: 'laser',
        angle: this.angle,
        x,
        y,
        speed: 500,
        playerId: this.playerId,
        damageAmount: DAMAGE.laser,
        damageOverTime: 0,
      },
      this.scene,
    );

    this.player.addProjectile(projectile);
  }

  public handleDamage(damage: number, overTime: number): void {
    if (overTime) {
      if (this.hp >= 0) {
        const currentDamage = Math.floor(damage / overTime);
        this.handleImmediateDamage(currentDamage);
        setTimeout(() => {
          this.handleDamage(damage - currentDamage, overTime - 1);
        }, 1000);
      }
    } else {
      this.handleImmediateDamage(damage);
    }
  }

  private handleImmediateDamage(damage: number): void {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.scene.events.emit(EVENTS.BOT_DESTROYED, {botId: this.botId, playerId: this.playerId});
      this.isOwned = false;
      this.destroy();
    }
  }
}
