import * as Phaser from 'phaser';

export class Deck {
  private scene: Phaser.Scene;

  private resetKey: Phaser.Input.Keyboard.Key;

  private nextReset!: number;

  private cards: string[];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cards = [];

    this.resetKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.nextReset = 0;
  }

  private reset(): void {
    this.cards = [];
  }

  private handleReset(): void {
    if (this.resetKey.isDown && this.nextReset < this.scene.time.now) {
      this.reset();
      this.nextReset = this.scene.time.now + 500;
    }
  }

  public update(): void {
    this.handleReset();
  }
}
