import * as Phaser from 'phaser';
import {Bullet} from './Bullet';
import {getAngleFromSpeed} from './utils/trig';

export class Player extends Phaser.GameObjects.Image {
  public body: Phaser.Physics.Arcade.Body;
  private oldPosition: {
    x: number;
    y: number;
    angle: number;
  };
  private projectiles: Phaser.GameObjects.Group;
  public playerId: string;
  private socket: SocketIOClient.Socket;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private shoot: Phaser.Input.Keyboard.Key;

  constructor({scene, x, y, key}: {scene: Phaser.Scene; x: number; y: number; key: string}, playerId: string, socket: SocketIOClient.Socket) {
    super(scene, x, y, key);
    this.initInput();
    this.oldPosition = {
      x: 0,
      y: 0,
      angle: 0,
    };
    this.playerId = playerId;
    this.projectiles = this.scene.add.group({
      runChildUpdate: true,
    });
    this.setAngle(270).setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    this.socket = socket;
    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    scene.add.existing(this);
  }

  public getProjectiles(): Phaser.GameObjects.Group {
    return this.projectiles;
  }

  public handleShoot(): void {
    if (this.shoot.isDown && this.projectiles.getLength() < 1) {
      console.log('firing bullet');
      this.projectiles.add(new Bullet({
        x: this.x,
        y: this.y,
        scene: this.scene,
        key: 'bullet',
      }, this.angle));
    }
  }

  private initInput(): void {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.shoot = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  private handleMovement(): void {
    const {up, down, left, right} = this.cursors;
    if (up.isDown || down.isDown || left.isDown || right.isDown) {
      let speed = 200;
      const keysCount = [up, down, right, left].reduce((prev, cur) => prev + (cur.isDown ? 1 : 0), 0);
      if (keysCount > 1) {
        speed /= Math.sqrt(2);
      }
      let xSpeed = 0;
      let ySpeed = 0;
      xSpeed -= left.isDown ? speed : 0;
      xSpeed += right.isDown ? speed : 0;
      ySpeed -= up.isDown ? speed : 0;
      ySpeed += down.isDown ? speed : 0;
      this.body.setVelocity(xSpeed, ySpeed);
      this.setAngle(getAngleFromSpeed(xSpeed, ySpeed));
    } else {
      this.body.setVelocity(0);
    }
  }

  public update(): void {
    this.handleMovement();
    this.handleShoot();

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
