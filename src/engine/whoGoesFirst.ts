import { getJurisdiction } from "@/content/jurisdictions";
import { assertNever, destinationOf, opposite, rightApproachOf } from "./geometry";
import {
  type Actor,
  type Approach,
  type IntersectionScene,
  type Jurisdiction,
  type JurisdictionId,
  type LightState,
  type RightOfWayResult,
  type SignRole,
  type TrafficHand,
} from "./types";

function signRoleOn(scene: IntersectionScene, approach: Approach): SignRole | null {
  return scene.signs.find((sign) => sign.facing === approach)?.role ?? null;
}

function signRank(role: SignRole | null): number {
  switch (role) {
    case "priority-road":
    case "priority-over-oncoming":
      return 0;
    case null:
    case "end-priority-road":
      return 1;
    case "yield":
    case "priority-to-oncoming":
      return 2;
    case "stop":
      return 3;
    default:
      return assertNever(role);
  }
}

function lightRank(state: LightState | undefined, lightsActive: boolean): number {
  if (!lightsActive) {
    return 3;
  }
  switch (state) {
    case "green":
      return 0;
    case "yellow":
      return 1;
    case "flashing-yellow":
      return 2;
    case undefined:
    case "off":
      return 3;
    case "flashing-red":
      return 4;
    case "red":
      return 5;
    default:
      return assertNever(state);
  }
}

function pathsConflict(a: Actor, b: Actor, hand: TrafficHand): boolean {
  if (a.id === b.id) {
    return false;
  }

  if (a.kind === "pedestrian" && b.kind === "pedestrian") {
    return false;
  }

  if (a.kind === "pedestrian" || b.kind === "pedestrian") {
    const ped = a.kind === "pedestrian" ? a : b;
    const vehicle = a.kind === "pedestrian" ? b : a;
    const dest = destinationOf(vehicle.approach, vehicle.intent, hand);
    return dest === ped.approach || vehicle.intent !== "straight";
  }

  const destA = destinationOf(a.approach, a.intent, hand);
  const destB = destinationOf(b.approach, b.intent, hand);

  if (a.approach === b.approach) {
    return destA === destB;
  }

  if (opposite(a.approach) === b.approach) {
    if (a.intent === "straight" && b.intent === "straight") {
      return false;
    }
    if (a.intent === "right" && b.intent === "right") {
      return false;
    }
    if (a.intent === "left" && (b.intent === "straight" || b.intent === "right")) {
      return true;
    }
    if (b.intent === "left" && (a.intent === "straight" || a.intent === "right")) {
      return true;
    }
    return a.intent === "left" && b.intent === "left";
  }

  if (a.intent === "straight" && b.intent === "straight") {
    return true;
  }
  if (destA === destB) {
    return true;
  }
  if (destA === b.approach || destB === a.approach) {
    return true;
  }
  return false;
}

function compareRanks(left: number[], right: number[]): number {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const delta = (left[index] ?? 0) - (right[index] ?? 0);
    if (delta !== 0) {
      return delta;
    }
  }
  return 0;
}

function actorRank(
  actor: Actor,
  scene: IntersectionScene,
  jurisdiction: Jurisdiction,
  others: Actor[],
): number[] {
  const lightsActive = Boolean(
    scene.lights?.some((light) => light.state !== "off"),
  );
  const light = scene.lights?.find((item) => item.facing === actor.approach);
  const fourWay = Boolean(scene.fourWayStop);

  const pedestrian = actor.kind === "pedestrian" ? 0 : 1;
  const emergency = actor.kind === "emergency" && actor.emergencyLights ? 0 : 1;
  const inside = actor.alreadyInIntersection ? 0 : 1;
  const lightValue = lightRank(light?.state, lightsActive);
  const tram =
    actor.kind === "tram" &&
    jurisdiction.tramPriority === "uncontrolled-over-vehicles" &&
    !lightsActive
      ? 0
      : 1;
  const signs = signRank(signRoleOn(scene, actor.approach));
  const arrival = fourWay ? (actor.arrivedAtMs ?? 0) : 0;

  const rightPenalty = others.some(
    (other) =>
      other.id !== actor.id &&
      actor.kind !== "pedestrian" &&
      other.kind !== "pedestrian" &&
      other.approach === rightApproachOf(actor.approach) &&
      pathsConflict(actor, other, jurisdiction.trafficHand),
  )
    ? 1
    : 0;

  const leftPenalty =
    actor.intent === "left" &&
    others.some(
      (other) =>
        other.id !== actor.id &&
        other.intent !== "left" &&
        pathsConflict(actor, other, jurisdiction.trafficHand),
    )
      ? 1
      : 0;

  return [
    pedestrian,
    emergency,
    inside,
    lightValue,
    tram,
    signs,
    arrival,
    rightPenalty,
    leftPenalty,
  ];
}

function reasonFor(actor: Actor, scene: IntersectionScene, jurisdiction: Jurisdiction): string {
  if (actor.kind === "pedestrian") {
    return "reason.pedestrian";
  }
  if (actor.kind === "emergency" && actor.emergencyLights) {
    return "reason.emergency";
  }
  if (actor.alreadyInIntersection) {
    return "reason.alreadyInside";
  }
  if (scene.lights?.some((light) => light.state !== "off")) {
    return "reason.trafficLight";
  }
  if (
    actor.kind === "tram" &&
    jurisdiction.tramPriority === "uncontrolled-over-vehicles"
  ) {
    return "reason.tram";
  }
  const role = signRoleOn(scene, actor.approach);
  if (role === "priority-road") {
    return "reason.priorityRoad";
  }
  if (role === "stop") {
    return "reason.stop";
  }
  if (role === "yield") {
    return "reason.yield";
  }
  if (scene.fourWayStop) {
    return "reason.fourWayStop";
  }
  return "reason.yieldToRight";
}

export function whoGoesFirst(
  scene: IntersectionScene,
  jurisdictionId: JurisdictionId,
): RightOfWayResult {
  const jurisdiction = getJurisdiction(jurisdictionId);
  const ranked = [...scene.actors].sort((left, right) =>
    compareRanks(
      actorRank(left, scene, jurisdiction, scene.actors),
      actorRank(right, scene, jurisdiction, scene.actors),
    ),
  );

  const reasonKeys: Record<string, string> = {};
  for (const actor of ranked) {
    reasonKeys[actor.id] = reasonFor(actor, scene, jurisdiction);
  }

  return {
    order: ranked.map((actor) => actor.id),
    reasonKeys,
  };
}
