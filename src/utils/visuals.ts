export function createFloatingText(scene: Phaser.Scene, x: number, y: number, message: string, color = '#fff'): void {
  const animation = scene.add.text(x, y, message, {color});

  scene.add.tween({
    targets: animation,
    duration: 750,
    ease: 'Exponential.In',
    y: y - 50,

    onComplete: () => {
      animation.destroy();
    },
    callbackScope: scene,
  });
}
