export interface ProjectileOpts extends WeaponProjectileOpts {
  key: string;
  damage: number;
}

export interface WeaponProjectileOpts {
  x: number;
  y: number;
  scene: Phaser.Scene;
  angle: number;
}
