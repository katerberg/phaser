import * as Phaser from 'phaser';
import {ResourceCard} from './cards';
import {EVENTS, RULES, SCENES, MAX, SPEED} from './constants';
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

  private nextDraw: number;

  private nextSpawnEnemy: number;

  private nextPlayCard: number;

  public playerId: string;

  private socket: SocketIOClient.Socket;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private shoot: Phaser.Input.Keyboard.Key;

  private draw: Phaser.Input.Keyboard.Key;

  private spawnEnemy: Phaser.Input.Keyboard.Key;

  private inventory: Inventory;

  private handInputs: Phaser.Input.Keyboard.Key[];

  private costs: {
    draw: number;
    shoot: number;
  };

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
    this.draw = this.scene.input.keyboard.addKey(KeyCodes.W);
    this.spawnEnemy = this.scene.input.keyboard.addKey(KeyCodes.P);
    this.oldPosition = {
      x: 0,
      y: 0,
      angle: 0,
    };
    this.max = {energy: MAX.energy, hp: MAX.hp};
    this.costs = {
      draw: 50,
      shoot: 10,
    };
    this.nextShot = 0;
    this.nextDraw = 0;
    this.nextSpawnEnemy = 0;
    this.nextPlayCard = 0;
    this.hp = this.max.hp;
    this.energy = 10;
    this.playerId = playerId;
    this.projectiles = this.scene.add.group({
      runChildUpdate: true,
    });
    this.handInputs = [
      this.scene.input.keyboard.addKey(KeyCodes.A),
      this.scene.input.keyboard.addKey(KeyCodes.S),
      this.scene.input.keyboard.addKey(KeyCodes.D),
      this.scene.input.keyboard.addKey(KeyCodes.F),
      this.scene.input.keyboard.addKey(KeyCodes.G),
    ];
    this.scene.time.addEvent({
      delay: isDebug() ? 1 : 100,
      callback: this.handleManaUpdate,
      callbackScope: this,
      loop: true,
    });

    this.setAngle(270).setOrigin(0.5, 0.5).setDisplaySize(35, 43);
    this.socket = socket;
    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    scene.add.existing(this);

    const cardsLevel = this.scene.scene.get(SCENES.cards);
    cardsLevel.events.on(EVENTS.RESOURCE_PLAYED, this.handleResourcePlay, this);
  }

  public getProjectiles(): Phaser.GameObjects.Group {
    return this.projectiles;
  }

  public handleDamage(damage: number): void {
    this.hp -= damage;
    this.scene.registry.set('playerHp', this.hp);
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
    if (this.shoot.isDown && this.nextShot < this.scene.time.now && this.energy >= this.costs.shoot) {
      const {x, y} = getProjectilePosition(this.x, this.y, this.angle);
      const projectile = this.inventory.createProjectile(x, y, this.angle);
      this.updateMana(this.energy - this.costs.shoot);
      this.projectiles.add(projectile);
      this.socket.emit('projectileFiring', {
        x: this.x,
        y: this.y,
        angle: this.angle,
        speed: projectile.speed,
        projectileType: projectile.projectileType,
        id: projectile.id,
      });
      this.nextShot = this.scene.time.now + 200;
    }
  }

  private handleDraw(): void {
    if (
      this.draw.isDown &&
      this.nextDraw < this.scene.time.now &&
      this.energy >= this.costs.draw &&
      this.scene.scene.get(SCENES.cards).registry.get('numberOfCardsInHand') !== RULES.maxHand &&
      this.scene.scene.get(SCENES.cards).registry.get('numberOfCardsInDeck') !== 0
    ) {
      this.scene.events.emit(EVENTS.DRAW_CARD);
      this.updateMana(this.energy - this.costs.draw);
      this.nextDraw = this.scene.time.now + 200;
    }
  }

  private handlePlayCard(): void {
    const [one, two, three, four, five] = this.handInputs;
    if (
      this.nextPlayCard < this.scene.time.now &&
      (one.isDown || two.isDown || three.isDown || four.isDown || five.isDown)
    ) {
      if (one.isDown) {
        this.scene.events.emit(EVENTS.PLAY_CARD, 0);
      } else if (two.isDown) {
        this.scene.events.emit(EVENTS.PLAY_CARD, 1);
      } else if (three.isDown) {
        this.scene.events.emit(EVENTS.PLAY_CARD, 2);
      } else if (four.isDown) {
        this.scene.events.emit(EVENTS.PLAY_CARD, 3);
      } else if (five.isDown) {
        this.scene.events.emit(EVENTS.PLAY_CARD, 4);
      }
      this.nextPlayCard = this.scene.time.now + 300;
    }
  }

  private handleManaUpdate(): void {
    if (this.energy < this.max.energy) {
      this.updateMana(this.energy + 1);
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

  private updateMana(newMana: number): void {
    this.energy = newMana;
    this.scene.registry.set('playerMana', this.energy);
    this.scene.events.emit(EVENTS.ENERGY_CHANGED);
  }

  private handleInput(): void {
    this.handleMovement();
    this.handleShoot();
    this.handleDraw();
    this.handlePlayCard();
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
    this.scene.registry.set('resource', resource);
    this.scene.events.emit(EVENTS.RESOURCE_ADDED);
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
