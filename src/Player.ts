export class Player extends Phaser.GameObjects.Image {
  public body: Phaser.Physics.Arcade.Body;
  private oldPosition: {
    x: number;
    y: number;
    angle: number;
  };
  private socket: SocketIOClient.Socket;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor({scene, x, y, key}: {scene: Phaser.Scene, x: number, y: number, key: string}, socket: SocketIOClient.Socket) {
    super(scene, x, y, key);
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.oldPosition = {
      x: 0,
      y: 0,
      angle: 0,
    }
    this.setAngle(270).setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    this.socket = socket;
    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds()
    scene.add.existing(this);
  }

  private handleMovement() {
    const {up,down,left,right} = this.cursors;
    if (up.isDown || down.isDown || left.isDown || right.isDown) {
      let speed = 200;
      let keysCount = [up, down, right, left].reduce((prev, cur) => prev + (cur.isDown ? 1 : 0), 0);
      if (keysCount > 1) {
        speed /= Math.sqrt(2);
      }
      let xSpeed = 0;
      let ySpeed = 0;
      xSpeed -= left.isDown ? speed : 0;
      xSpeed += right.isDown ? speed : 0;
      ySpeed -= up.isDown ? speed : 0;
      ySpeed += down.isDown ? speed : 0;
      this.body.setVelocity(xSpeed,ySpeed)
      this.setAngle(this.getAngleFromSpeed(xSpeed, ySpeed))
    } else {
      this.body.setVelocity(0);
    }
  }

  public update() {
    this.handleMovement();

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

  private getAngleFromSpeed(x: number, y: number): number {
    const [north, south, west, east, northeast, southeast, southwest, northwest] = [270, 90, 180, 0, 315, 45, 135, 225];
    if (y > 0) {
      if (x > 0) {
        return southeast;
      } else if (x < 0) {
        return southwest;
      } else {
        return south;
      }
    } else if (y < 0) {
      if (x > 0) {
        return northeast;
      } else if (x < 0){
        return northwest;
      } else {
        return north;
      }
    } else {
      if (x > 0) {
        return east;
      } else if (x < 0){
        return west;
      } else {
        return north;
      }
    }
  }
}
