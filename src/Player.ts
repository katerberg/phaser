import * as Phaser from 'phaser';
import {v4 as uuid} from 'uuid';
import {Arrow} from './projectiles';
import {constants} from './utils/constants';
import {getAngleFromSpeed} from './utils/trig';

interface Maximums {
  mana: number;
  hp: number;
}

export class Player extends Phaser.GameObjects.Image {
  public body!: Phaser.Physics.Arcade.Body; // handled by world.enable

  private oldPosition: {
    x: number;
    y: number;
    angle: number;
  };

  private max: Maximums;

  private hp: number;

  private mana: number;

  private spellCost: number;

  private projectiles: Phaser.GameObjects.Group;

  private nextShot: number;

  private nextDraw: number;

  public playerId: string;

  private socket: SocketIOClient.Socket;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private shoot: Phaser.Input.Keyboard.Key;

  private draw: Phaser.Input.Keyboard.Key;

  constructor(
    {scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string},
    playerId: string,
    socket: SocketIOClient.Socket,
  ) {
    super(scene, x, y, key);
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.shoot = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.draw = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.oldPosition = {
      x: 0,
      y: 0,
      angle: 0,
    };
    this.max = {mana: 100, hp: 3};
    this.spellCost = 10;
    this.nextShot = 0;
    this.nextDraw = 0;
    this.hp = this.max.hp;
    this.mana = this.spellCost;
    this.playerId = playerId;
    this.projectiles = this.scene.add.group({
      runChildUpdate: true,
    });
    this.scene.time.addEvent({
      delay: 100,
      callback: this.handleManaUpdate,
      callbackScope: this,
      loop: true,
    });

    this.setAngle(270).setOrigin(0.5, 0.5).setDisplaySize(35, 43);
    this.socket = socket;
    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    scene.add.existing(this);
  }

  public getProjectiles(): Phaser.GameObjects.Group {
    return this.projectiles;
  }

  public handleDamage(damage: number): void {
    this.hp -= damage;
    this.scene.registry.set('playerHp', this.hp);
    this.scene.events.emit('hpChanged');
    if (this.hp <= 0) {
      this.socket.emit('playerDying', {playerId: this.playerId});
    }
  }

  public handleShoot(): void {
    if (this.shoot.isDown && this.nextShot < this.scene.time.now && this.mana >= this.spellCost) {
      const bullet = new Arrow(
        {
          x: this.x,
          y: this.y,
          scene: this.scene,
          key: 'arrow',
        },
        this.angle,
        uuid() as string,
      );
      this.updateMana(this.mana - this.spellCost);
      this.projectiles.add(bullet);
      this.socket.emit('projectileFiring', {
        x: this.x,
        y: this.y,
        angle: this.angle,
        speed: bullet.speed,
        projectileType: bullet.projectileType,
        id: bullet.id,
      });
      this.nextShot = this.scene.time.now + 200;
    }
  }

  public handleDraw(): void {
    if (this.draw.isDown && this.nextDraw < this.scene.time.now) {
      this.scene.events.emit('drawCard');
      this.nextDraw = this.scene.time.now + 200;
    }
  }

  private handleManaUpdate(): void {
    if (this.mana < this.max.mana) {
      this.updateMana(this.mana + 1);
    }
  }

  private handleMovement(): void {
    const {up, down, left, right} = this.cursors;
    if (up?.isDown || down?.isDown || left?.isDown || right?.isDown) {
      let speed = constants.speed.player;
      const keysCount = [up, down, right, left].reduce((prev, cur) => prev + (cur?.isDown ? 1 : 0), 0);
      if (keysCount > 1) {
        speed /= Math.sqrt(2);
      }
      let xSpeed = 0;
      let ySpeed = 0;
      xSpeed -= left?.isDown ? speed : 0;
      xSpeed += right?.isDown ? speed : 0;
      ySpeed -= up?.isDown ? speed : 0;
      ySpeed += down?.isDown ? speed : 0;
      this.body.setVelocity(xSpeed, ySpeed);
      this.setAngle(getAngleFromSpeed(xSpeed, ySpeed));
    } else {
      this.body.setVelocity(0);
    }
  }

  private updateMana(newMana: number): void {
    this.mana = newMana;
    this.scene.registry.set('playerMana', this.mana);
    this.scene.events.emit('manaChanged');
  }

  public update(): void {
    this.handleMovement();
    this.handleShoot();
    this.handleDraw();

    const {x, y, angle} = this;
    if (x !== this.oldPosition.x || y !== this.oldPosition.y || angle !== this.oldPosition.angle) {
      this.socket.emit('playerMovement', {x: this.x, y: this.y, angle: this.angle});
    }

    this.oldPosition = {
      x: this.x,
      y: this.y,
      angle: this.angle,
    };
  }
}
