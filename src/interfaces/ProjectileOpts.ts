export interface ProjectileOpts extends WeaponProjectileOpts {
  key: string;
  speed: number;
  damageAmount: number;
  damageOverTime: number;
}

export interface WeaponProjectileOpts {
  x: number;
  y: number;
  scene: Phaser.Scene;
  angle: number;
}
