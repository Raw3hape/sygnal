export const APPROACHES = ["north", "east", "south", "west"] as const;
export type Approach = (typeof APPROACHES)[number];

export const INTENTS = ["straight", "left", "right", "uturn"] as const;
export type Intent = (typeof INTENTS)[number];

export const ACTOR_KINDS = [
  "car",
  "tram",
  "bus",
  "motorcycle",
  "bicycle",
  "pedestrian",
  "emergency",
] as const;
export type ActorKind = (typeof ACTOR_KINDS)[number];

export const LIGHT_STATES = [
  "red",
  "yellow",
  "green",
  "flashing-yellow",
  "flashing-red",
  "off",
] as const;
export type LightState = (typeof LIGHT_STATES)[number];

export const SIGN_ROLES = [
  "stop",
  "yield",
  "priority-road",
  "end-priority-road",
  "priority-to-oncoming",
  "priority-over-oncoming",
] as const;
export type SignRole = (typeof SIGN_ROLES)[number];

export const TOPOLOGIES = ["cross", "t", "roundabout", "narrow"] as const;
export type Topology = (typeof TOPOLOGIES)[number];

export const LOCALES = ["en", "pl", "ru"] as const;
export type AppLocale = (typeof LOCALES)[number];

export const JURISDICTION_IDS = ["PL", "DE", "US-CA", "RU", "UA"] as const;
export type JurisdictionId = (typeof JURISDICTION_IDS)[number];

export const CONVENTIONS = ["vienna", "mutcd"] as const;
export type SignConvention = (typeof CONVENTIONS)[number];

export const TRAFFIC_HANDS = ["right", "left"] as const;
export type TrafficHand = (typeof TRAFFIC_HANDS)[number];

export const RIGHT_OF_WAY_DEFAULTS = [
  "yield-to-right",
  "four-way-stop",
  "uncontrolled-yield-to-right",
] as const;
export type RightOfWayDefault = (typeof RIGHT_OF_WAY_DEFAULTS)[number];

export const TRAM_PRIORITIES = ["uncontrolled-over-vehicles", "as-vehicle"] as const;
export type TramPriority = (typeof TRAM_PRIORITIES)[number];

export const SPEED_UNITS = ["metric", "imperial"] as const;
export type SpeedUnit = (typeof SPEED_UNITS)[number];

export interface Jurisdiction {
  id: JurisdictionId;
  convention: SignConvention;
  trafficHand: TrafficHand;
  defaultRightOfWay: RightOfWayDefault;
  tramPriority: TramPriority;
  speedUnit: SpeedUnit;
  urbanDefaultSpeed: number;
  nameKey: string;
}

export interface Actor {
  id: string;
  kind: ActorKind;
  approach: Approach;
  intent: Intent;
  arrivedAtMs?: number;
  alreadyInIntersection?: boolean;
  emergencyLights?: boolean;
}

export interface ApproachSign {
  facing: Approach;
  role: SignRole;
}

export interface TrafficLight {
  facing: Approach;
  state: LightState;
}

export interface IntersectionScene {
  id: string;
  topology: Topology;
  signs: ApproachSign[];
  lights?: TrafficLight[];
  actors: Actor[];
  fourWayStop?: boolean;
}

export interface RightOfWayResult {
  order: string[];
  reasonKeys: Record<string, string>;
}
