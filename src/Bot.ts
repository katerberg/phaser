import * as Phaser from 'phaser';
import {Enemy} from './Enemy';
import {constants} from './utils/constants';

export class Bot extends Enemy {
  public botId: string;

  public hp: number;

  constructor({scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string}, id: string, botId: string) {
    super({scene, x, y, key}, id);
    this.botId = botId;
    this.hp = 10;
  }

  handleDamage(damage: number): void {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.scene.events.emit(constants.events.BOT_DESTROYED, {botId: this.botId, playerId: this.playerId});
      this.destroy();
    }
  }
}
