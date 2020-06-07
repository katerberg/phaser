export interface ProjectileOpts extends WeaponProjectileOpts {
  key: string;
}

export interface WeaponProjectileOpts {
  x: number;
  y: number;
  scene: Phaser.Scene;
  angle: number;
}
