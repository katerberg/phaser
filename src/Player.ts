import * as Phaser from 'phaser';
import {ResourceCard} from './cards';
import {EVENTS, SCENES, MAX, REGISTRIES, SPEED} from './constants';
import {Inventory} from './Inventory';
import {isDebug} from './utils/environments';
import {getAngleFromSpeed, getProjectilePosition} from './utils/trig';

interface Maximums {
  energy: number;
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

  private energy: number;

  private projectiles: Phaser.GameObjects.Group;

  private nextShot: number;

  private nextSpawnEnemy: number;

  public playerId: string;

  private socket: SocketIOClient.Socket;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private shoot: Phaser.Input.Keyboard.Key;

  private spawnEnemy: Phaser.Input.Keyboard.Key;

  private inventory: Inventory;

  constructor(
    {scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string},
    playerId: string,
    socket: SocketIOClient.Socket,
  ) {
    super(scene, x, y, key);
    this.inventory = new Inventory(scene);
    const {KeyCodes} = Phaser.Input.Keyboard;
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.shoot = this.scene.input.keyboard.addKey(KeyCodes.SPACE);
    this.spawnEnemy = this.scene.input.keyboard.addKey(KeyCodes.P);
    this.oldPosition = {
      x: 0,
      y: 0,
      angle: 0,
    };
    this.max = {energy: MAX.energy, hp: MAX.hp};
    this.nextShot = 0;
    this.nextSpawnEnemy = 0;
    this.hp = this.max.hp;
    this.energy = 10;
    this.playerId = playerId;
    this.projectiles = this.scene.add.group({
      runChildUpdate: true,
    });
    this.scene.time.addEvent({
      delay: isDebug() ? 1 : 100,
      callback: this.handleEnergyUpdate,
      callbackScope: this,
      loop: true,
    });

    this.setAngle(270).setOrigin(0.5, 0.5).setDisplaySize(35, 43);
    this.socket = socket;
    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    scene.add.existing(this);

    this.scene.events.on(EVENTS.UPDATE_ENERGY, this.updateEnergy, this);
    this.scene.events.on(EVENTS.WEAPON_CHANGED, this.handleWeaponChanged, this);

    const cardsLevel = this.scene.scene.get(SCENES.cards);
    cardsLevel.events.on(EVENTS.RESOURCE_PLAYED, this.handleResourcePlay, this);
  }

  public getProjectiles(): Phaser.GameObjects.Group {
    return this.projectiles;
  }

  public handleDamage(damage: number): void {
    this.hp -= damage;
    this.scene.registry.set(REGISTRIES.PLAYER_HP, this.hp);
    this.scene.events.emit(EVENTS.HP_CHANGED);
    if (this.hp <= 0) {
      this.socket.emit('playerDying', {playerId: this.playerId});
      this.scene.events.emit(EVENTS.PLAYER_DIED);
      Object.values(EVENTS).forEach((event) => {
        this.scene.events.removeListener(event);
      });
    }
  }

  private handleShoot(): void {
    if (
      this.shoot.isDown &&
      this.nextShot < this.scene.time.now &&
      this.energy >= this.inventory.currentWeapon.costOfShot
    ) {
      const {x, y} = getProjectilePosition(this.x, this.y, this.angle);
      const projectile = this.inventory.createProjectile(x, y, this.angle);
      const {currentWeapon} = this.inventory;
      this.updateEnergy(this.energy - currentWeapon.costOfShot);
      this.projectiles.add(projectile);
      this.socket.emit('projectileFiring', {
        x: this.x,
        y: this.y,
        angle: this.angle,
        speed: projectile.speed,
        projectileType: projectile.projectileType,
        id: projectile.id,
      });
      this.nextShot = this.scene.time.now + currentWeapon.rechargeDelay;
    }
  }

  private handleWeaponChanged(): void {
    this.nextShot = this.scene.time.now + this.inventory.currentWeapon.rechargeDelay;
  }

  private handleEnergyUpdate(): void {
    if (this.energy < this.max.energy) {
      this.updateEnergy(this.energy + 1);
    }
  }

  private handleMovement(): void {
    const {up, down, left, right} = this.cursors;
    if (up?.isDown || down?.isDown || left?.isDown || right?.isDown) {
      let speed = SPEED.player;
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

  private updateEnergy(newEnergy: number): void {
    this.energy = newEnergy;
    this.scene.registry.set(REGISTRIES.PLAYER_ENERGY, this.energy);
    this.scene.events.emit(EVENTS.ENERGY_CHANGED);
  }

  private handleInput(): void {
    this.handleMovement();
    this.handleShoot();
    if (isDebug()) {
      this.handleSpawnEnemy();
    }
  }

  private handleSpawnEnemy(): void {
    if (this.spawnEnemy.isDown && this.nextSpawnEnemy < this.scene.time.now) {
      this.socket.emit('spawnBot', {playerId: this.playerId});
      this.nextSpawnEnemy = this.scene.time.now + 300;
    }
  }

  private handleResourcePlay(resource: ResourceCard): void {
    this.scene.events.emit(EVENTS.RESOURCE_ADDED, resource);
  }

  public update(): void {
    this.handleInput();
    this.inventory.update();

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
