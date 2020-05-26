export const GAME = {
  width: 1388,
  height: 900,
  cardWidth: 174,
  weaponHeight: 174,
};
export const PLAY_AREA = {
  width: 1088,
  height: 640,
  xOffset: 150,
  yOffset: 0,
};
export const SPEED = {
  player: 150,
  arrow: 250,
  laser: 2500,
  bullet: 400,
};
export const RULES = {
  maxBlueprints: 4,
  maxWeapons: 4,
  maxHand: 5,
  maxHp: 10,
  maxEnergy: 200,
};
export const STARTING = {
  energy: 10,
  hp: 10,
};
export const MAX = {
  energy: 200,
  hp: 10,
};
export const PLAYER = {
  height: 34,
};
export const SCENES = {
  game: 'GameScene',
  hud: 'HudScene',
  loading: 'LoadingScene',
  menu: 'MenuScene',
  cards: 'CardsScene',
};
export const SYMBOLS = {
  energy: '⚛',
  moon: '☾',
};
export const EVENTS = {
  REMOVE_CURRENT_BLUEPRINT: 'removeCurrentBlueprint',
  NEW_WEAPON_PLAYED: 'newWeaponPlayed',
  BLUEPRINT_PLAYED: 'blueprintPlayed',
  RESOURCE_PLAYED: 'resourcePlayed',
  DRAW_CARD: 'drawCard',
  PLAY_CARD: 'playCard',
  PLAYER_DIED: 'playerDied',
  HP_CHANGED: 'hpChanged',
  ENERGY_CHANGED: 'energyChanged',
  BLUEPRINT_CHANGED: 'blueprintChanged',
  BLUEPRINT_ADDED: 'blueprintAdded',
  WEAPON_CHANGED: 'weaponChanged',
  WEAPON_ADDED: 'weaponAdded',
  WEAPON_REMOVED: 'weaponRemoved',
  RESOURCE_ADDED: 'resourceAdded',
  ADD_CARD_TO_DECK: 'addCardToDeck',
  BOT_DESTROYED: 'botDestroyed',
  PROJECTILE_FIRED: 'projectileFired',
};
