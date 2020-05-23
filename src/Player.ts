import * as Phaser from 'phaser';
import {Inventory} from './Inventory';
import {constants} from './utils/constants';
import {isDebug} from './utils/environments';
import {getAngleFromSpeed, getProjectilePosition} from './utils/trig';

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

  private projectiles: Phaser.GameObjects.Group;

  private nextShot: number;

  private nextDraw: number;

  private nextPlayCard: number;

  public playerId: string;

  private socket: SocketIOClient.Socket;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private shoot: Phaser.Input.Keyboard.Key;

  private draw: Phaser.Input.Keyboard.Key;

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
    this.oldPosition = {
      x: 0,
      y: 0,
      angle: 0,
    };
    this.max = {mana: 100, hp: 3};
    this.costs = {
      draw: 50,
      shoot: 10,
    };
    this.nextShot = 0;
    this.nextDraw = 0;
    this.nextPlayCard = 0;
    this.hp = this.max.hp;
    this.mana = 10;
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

    const cardsLevel = this.scene.scene.get(constants.scenes.cards);
    cardsLevel.events.on('resourcePlayed', this.handleResourcePlay, this);
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

  private handleShoot(): void {
    if (this.shoot.isDown && this.nextShot < this.scene.time.now && this.mana >= this.costs.shoot) {
      const {x, y} = getProjectilePosition(this.x, this.y, this.angle);
      const bullet = this.inventory.createProjectile(x, y, this.angle);
      this.updateMana(this.mana - this.costs.shoot);
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

  private handleDraw(): void {
    if (
      this.draw.isDown &&
      this.nextDraw < this.scene.time.now &&
      this.mana >= this.costs.draw &&
      this.scene.scene.get(constants.scenes.cards).registry.get('numberOfCards') !== constants.rules.maxHand
    ) {
      this.scene.events.emit('drawCard');
      this.updateMana(this.mana - this.costs.draw);
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
        this.scene.events.emit('playCard', 0);
      } else if (two.isDown) {
        this.scene.events.emit('playCard', 1);
      } else if (three.isDown) {
        this.scene.events.emit('playCard', 2);
      } else if (four.isDown) {
        this.scene.events.emit('playCard', 3);
      } else if (five.isDown) {
        this.scene.events.emit('playCard', 4);
      }
      this.nextPlayCard = this.scene.time.now + 300;
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

  private handleInput(): void {
    this.handleMovement();
    this.handleShoot();
    this.handleDraw();
    this.handlePlayCard();
  }

  private handleResourcePlay(): void {
    const resource = this.scene.registry.get('resourcePlayed');
    this.scene.registry.set('resource', resource);
    this.scene.events.emit('resourceAdded');
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
