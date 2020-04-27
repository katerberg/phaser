export function getAngleFromSpeed(x: number, y: number): number {
  const [north, south, west, east, northeast, southeast, southwest, northwest] = [270, 90, 180, 0, 315, 45, 135, 225];
  if (y > 0) {
    if (x > 0) {
      return southeast;
    } else if (x < 0) {
      return southwest;
    }
    return south;

  } else if (y < 0) {
    if (x > 0) {
      return northeast;
    } else if (x < 0) {
      return northwest;
    }
    return north;

  }
  if (x > 0) {
    return east;
  } else if (x < 0) {
    return west;
  }
  return north;
}
