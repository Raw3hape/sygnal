import type { Approach, Intent, TrafficHand } from "./types";

export function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}

export function opposite(approach: Approach): Approach {
  switch (approach) {
    case "north":
      return "south";
    case "south":
      return "north";
    case "east":
      return "west";
    case "west":
      return "east";
    default:
      return assertNever(approach);
  }
}

export function clockwise(approach: Approach): Approach {
  switch (approach) {
    case "north":
      return "east";
    case "east":
      return "south";
    case "south":
      return "west";
    case "west":
      return "north";
    default:
      return assertNever(approach);
  }
}

export function counterClockwise(approach: Approach): Approach {
  return opposite(clockwise(approach));
}

export function facingOf(approach: Approach): Approach {
  return opposite(approach);
}

/** Approach a conflicting vehicle would come from if it is on this driver's right. */
export function rightApproachOf(driverApproach: Approach): Approach {
  return clockwise(facingOf(driverApproach));
}

export function destinationOf(
  approach: Approach,
  intent: Intent,
  hand: TrafficHand,
): Approach {
  const facing = facingOf(approach);
  switch (intent) {
    case "straight":
      return facing;
    case "right":
      return hand === "right" ? clockwise(facing) : counterClockwise(facing);
    case "left":
      return hand === "right" ? counterClockwise(facing) : clockwise(facing);
    case "uturn":
      return approach;
    default:
      return assertNever(intent);
  }
}
