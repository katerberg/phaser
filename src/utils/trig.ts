import {PLAYER} from '../constants';

export function getAngleFromSpeed(x: number, y: number): number {
  const [north, south, west, east, northeast, southeast, southwest, northwest] = [270, 90, 180, 0, 315, 45, 135, 225];
  if (y > 0) {
    if (x > 0) {
      return southeast;
    }
    if (x < 0) {
      return southwest;
    }
    return south;
  }
  if (y < 0) {
    if (x > 0) {
      return northeast;
    }
    if (x < 0) {
      return northwest;
    }
    return north;
  }
  if (x > 0) {
    return east;
  }
  if (x < 0) {
    return west;
  }
  return north;
}

export function getProjectileStartPosition(playerX: number, playerY: number, angle: number): {x: number; y: number} {
  const playerOffset = PLAYER.height;
  const xOffset = Math.cos((angle * Math.PI) / 180) * playerOffset;
  const yOffset = Math.sin((angle * Math.PI) / 180) * playerOffset;
  return {x: playerX + xOffset, y: playerY + yOffset};
}
