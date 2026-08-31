import type { Actor, Approach, Intent, IntersectionScene, JurisdictionId } from "@/engine/types";

export const ACTOR_COLORS = ["#e8c547", "#3d7ea6", "#d4572a", "#5b8c5a", "#9b59b6"] as const;

export interface VisualActor extends Actor {
  color: string;
}

export interface VisualSign {
  code: string;
  approach: Approach;
}

export interface SceneClip {
  durationMs: number;
  pauseAtMs: number;
}

export interface VisualScene extends IntersectionScene {
  jurisdiction: JurisdictionId;
  camera: "orbit" | "driver";
  visualSigns: VisualSign[];
  visualActors: VisualActor[];
  clip?: SceneClip;
  promptKey: string;
}

const SHORT_CLIP: SceneClip = { durationMs: 7000, pauseAtMs: 2600 };
const LONG_CLIP: SceneClip = { durationMs: 9000, pauseAtMs: 3200 };

function actor(
  id: string,
  approach: Approach,
  color: string,
  extra: Partial<Actor> & { intent?: Intent } = {},
): VisualActor {
  return {
    id,
    kind: extra.kind ?? "car",
    approach,
    intent: extra.intent ?? "straight",
    color,
    arrivedAtMs: extra.arrivedAtMs,
    alreadyInIntersection: extra.alreadyInIntersection,
    emergencyLights: extra.emergencyLights,
  };
}

function signRole(code: string): IntersectionScene["signs"][number]["role"] {
  if (code === "D-1" || code === "2.1") {
    return "priority-road";
  }
  if (code === "A-7" || code === "2.4" || code === "R1-2") {
    return "yield";
  }
  if (code === "B-20" || code === "2.5" || code === "R1-1") {
    return "stop";
  }
  return "yield";
}

function build(
  scene: Omit<VisualScene, "actors" | "signs"> & { visualActors: VisualActor[]; visualSigns: VisualSign[] },
): VisualScene {
  return {
    ...scene,
    actors: scene.visualActors,
    signs: scene.visualSigns.map((sign) => ({
      facing: sign.approach,
      role: signRole(sign.code),
    })),
  };
}

export const SCENES: VisualScene[] = [
  build({
    id: "pl-uncontrolled-right",
    jurisdiction: "PL",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.uncontrolled",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("southbound", "south", ACTOR_COLORS[0]),
      actor("eastbound", "east", ACTOR_COLORS[1]),
    ],
  }),
  build({
    id: "pl-priority-road",
    jurisdiction: "PL",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.priority",
    clip: SHORT_CLIP,
    visualSigns: [
      { code: "D-1", approach: "north" },
      { code: "D-1", approach: "south" },
      { code: "A-7", approach: "east" },
      { code: "A-7", approach: "west" },
    ],
    visualActors: [
      actor("priority", "north", ACTOR_COLORS[0]),
      actor("side", "east", ACTOR_COLORS[1]),
    ],
  }),
  build({
    id: "pl-stop-vs-free",
    jurisdiction: "PL",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.stop",
    clip: SHORT_CLIP,
    visualSigns: [{ code: "B-20", approach: "east" }],
    visualActors: [
      actor("free", "south", ACTOR_COLORS[0]),
      actor("stopped", "east", ACTOR_COLORS[2]),
    ],
  }),
  build({
    id: "pl-left-vs-oncoming",
    jurisdiction: "PL",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.leftTurn",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("straight", "south", ACTOR_COLORS[0]),
      actor("lefty", "north", ACTOR_COLORS[3], { intent: "left" }),
    ],
  }),
  build({
    id: "pl-traffic-light",
    jurisdiction: "PL",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.lights",
    clip: SHORT_CLIP,
    lights: [
      { facing: "south", state: "green" },
      { facing: "north", state: "green" },
      { facing: "east", state: "red" },
      { facing: "west", state: "red" },
    ],
    visualSigns: [],
    visualActors: [
      actor("green", "south", ACTOR_COLORS[3]),
      actor("red", "east", ACTOR_COLORS[2]),
    ],
  }),
  build({
    id: "pl-roundabout",
    jurisdiction: "PL",
    topology: "roundabout",
    camera: "orbit",
    promptKey: "scene.roundabout",
    clip: LONG_CLIP,
    visualSigns: [{ code: "A-7", approach: "south" }],
    visualActors: [
      actor("inside", "west", ACTOR_COLORS[1], { alreadyInIntersection: true }),
      actor("entering", "south", ACTOR_COLORS[0]),
    ],
  }),
  build({
    id: "pl-tram",
    jurisdiction: "PL",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.tram",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("tram", "west", "#cfd8dc", { kind: "tram" }),
      actor("car", "south", ACTOR_COLORS[0]),
    ],
  }),
  build({
    id: "pl-pedestrian",
    jurisdiction: "PL",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.pedestrian",
    clip: SHORT_CLIP,
    visualSigns: [{ code: "D-6", approach: "east" }],
    visualActors: [
      actor("turner", "south", ACTOR_COLORS[0], { intent: "right" }),
      actor("walker", "east", "#f4efe6", { kind: "pedestrian" }),
    ],
  }),
  build({
    id: "pl-emergency",
    jurisdiction: "PL",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.emergency",
    clip: LONG_CLIP,
    visualSigns: [
      { code: "D-1", approach: "north" },
      { code: "D-1", approach: "south" },
      { code: "A-7", approach: "east" },
    ],
    visualActors: [
      actor("priority", "north", ACTOR_COLORS[0]),
      actor("ambulance", "east", "#f5f5f5", { kind: "emergency", emergencyLights: true }),
    ],
  }),
  build({
    id: "pl-three-cars",
    jurisdiction: "PL",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.uncontrolled",
    clip: LONG_CLIP,
    visualSigns: [],
    visualActors: [
      actor("southbound", "south", ACTOR_COLORS[0]),
      actor("eastbound", "east", ACTOR_COLORS[1]),
      actor("westbound", "west", ACTOR_COLORS[2]),
    ],
  }),
  build({
    id: "pl-t-junction",
    jurisdiction: "PL",
    topology: "t",
    camera: "orbit",
    promptKey: "scene.uncontrolled",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("southbound", "south", ACTOR_COLORS[0], { intent: "left" }),
      actor("eastbound", "east", ACTOR_COLORS[1]),
    ],
  }),
  build({
    id: "de-uncontrolled-right",
    jurisdiction: "DE",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.uncontrolled",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("southbound", "south", ACTOR_COLORS[0]),
      actor("eastbound", "east", ACTOR_COLORS[1]),
    ],
  }),
  build({
    id: "de-priority-road",
    jurisdiction: "DE",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.priority",
    clip: SHORT_CLIP,
    visualSigns: [
      { code: "D-1", approach: "north" },
      { code: "D-1", approach: "south" },
      { code: "A-7", approach: "east" },
    ],
    visualActors: [
      actor("priority", "north", ACTOR_COLORS[0]),
      actor("side", "east", ACTOR_COLORS[1]),
    ],
  }),
  build({
    id: "us-four-way-arrival",
    jurisdiction: "US-CA",
    topology: "cross",
    camera: "orbit",
    fourWayStop: true,
    promptKey: "scene.fourWay",
    clip: SHORT_CLIP,
    visualSigns: [
      { code: "R1-1", approach: "north" },
      { code: "R1-1", approach: "south" },
      { code: "R1-1", approach: "east" },
      { code: "R1-1", approach: "west" },
    ],
    visualActors: [
      actor("first", "south", ACTOR_COLORS[0], { arrivedAtMs: 1000 }),
      actor("second", "east", ACTOR_COLORS[1], { arrivedAtMs: 2500 }),
    ],
  }),
  build({
    id: "us-four-way-right",
    jurisdiction: "US-CA",
    topology: "cross",
    camera: "orbit",
    fourWayStop: true,
    promptKey: "scene.fourWay",
    clip: SHORT_CLIP,
    visualSigns: [
      { code: "R1-1", approach: "north" },
      { code: "R1-1", approach: "south" },
      { code: "R1-1", approach: "east" },
      { code: "R1-1", approach: "west" },
    ],
    visualActors: [
      actor("southbound", "south", ACTOR_COLORS[0], { arrivedAtMs: 1000 }),
      actor("eastbound", "east", ACTOR_COLORS[1], { arrivedAtMs: 1000 }),
    ],
  }),
  build({
    id: "us-yield-through",
    jurisdiction: "US-CA",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.stop",
    clip: SHORT_CLIP,
    visualSigns: [{ code: "R1-2", approach: "east" }],
    visualActors: [
      actor("through", "south", ACTOR_COLORS[0]),
      actor("yielding", "east", ACTOR_COLORS[2]),
    ],
  }),
  build({
    id: "us-left-vs-oncoming",
    jurisdiction: "US-CA",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.leftTurn",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("straight", "south", ACTOR_COLORS[0]),
      actor("lefty", "north", ACTOR_COLORS[3], { intent: "left" }),
    ],
  }),
  build({
    id: "us-pedestrian",
    jurisdiction: "US-CA",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.pedestrian",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("turner", "south", ACTOR_COLORS[0], { intent: "right" }),
      actor("walker", "east", "#f4efe6", { kind: "pedestrian" }),
    ],
  }),
  build({
    id: "ru-uncontrolled-right",
    jurisdiction: "RU",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.uncontrolled",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("southbound", "south", ACTOR_COLORS[0]),
      actor("eastbound", "east", ACTOR_COLORS[1]),
    ],
  }),
  build({
    id: "ru-priority",
    jurisdiction: "RU",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.priority",
    clip: SHORT_CLIP,
    visualSigns: [
      { code: "2.1", approach: "north" },
      { code: "2.1", approach: "south" },
      { code: "2.4", approach: "east" },
    ],
    visualActors: [
      actor("priority", "north", ACTOR_COLORS[0]),
      actor("side", "east", ACTOR_COLORS[1]),
    ],
  }),
  build({
    id: "ru-stop",
    jurisdiction: "RU",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.stop",
    clip: SHORT_CLIP,
    visualSigns: [{ code: "2.5", approach: "east" }],
    visualActors: [
      actor("free", "south", ACTOR_COLORS[0]),
      actor("stopped", "east", ACTOR_COLORS[2]),
    ],
  }),
  build({
    id: "ru-tram",
    jurisdiction: "RU",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.tram",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("tram", "west", "#cfd8dc", { kind: "tram" }),
      actor("car", "south", ACTOR_COLORS[0]),
    ],
  }),
  build({
    id: "ru-lights",
    jurisdiction: "RU",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.lights",
    clip: SHORT_CLIP,
    lights: [
      { facing: "south", state: "green" },
      { facing: "east", state: "red" },
    ],
    visualSigns: [],
    visualActors: [
      actor("green", "south", ACTOR_COLORS[3]),
      actor("red", "east", ACTOR_COLORS[2]),
    ],
  }),
  build({
    id: "ru-pedestrian",
    jurisdiction: "RU",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.pedestrian",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("turner", "south", ACTOR_COLORS[0], { intent: "right" }),
      actor("walker", "east", "#f4efe6", { kind: "pedestrian" }),
    ],
  }),
  build({
    id: "ua-uncontrolled-right",
    jurisdiction: "UA",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.uncontrolled",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("southbound", "south", ACTOR_COLORS[0]),
      actor("eastbound", "east", ACTOR_COLORS[1]),
    ],
  }),
  build({
    id: "ua-priority",
    jurisdiction: "UA",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.priority",
    clip: SHORT_CLIP,
    visualSigns: [
      { code: "D-1", approach: "north" },
      { code: "A-7", approach: "east" },
    ],
    visualActors: [
      actor("priority", "north", ACTOR_COLORS[0]),
      actor("side", "east", ACTOR_COLORS[1]),
    ],
  }),
  build({
    id: "ua-tram",
    jurisdiction: "UA",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.tram",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("tram", "west", "#cfd8dc", { kind: "tram" }),
      actor("car", "south", ACTOR_COLORS[0]),
    ],
  }),
  build({
    id: "ua-lights",
    jurisdiction: "UA",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.lights",
    clip: SHORT_CLIP,
    lights: [
      { facing: "south", state: "green" },
      { facing: "east", state: "red" },
    ],
    visualSigns: [],
    visualActors: [
      actor("green", "south", ACTOR_COLORS[3]),
      actor("red", "east", ACTOR_COLORS[2]),
    ],
  }),
  build({
    id: "ua-pedestrian",
    jurisdiction: "UA",
    topology: "cross",
    camera: "orbit",
    promptKey: "scene.pedestrian",
    clip: SHORT_CLIP,
    visualSigns: [],
    visualActors: [
      actor("turner", "south", ACTOR_COLORS[0], { intent: "right" }),
      actor("walker", "east", "#f4efe6", { kind: "pedestrian" }),
    ],
  }),
];

export function getScene(id: string): VisualScene {
  const found = SCENES.find((scene) => scene.id === id);
  if (!found) {
    throw new Error(`Unknown scene: ${id}`);
  }
  return found;
}

export function scenesFor(jurisdiction: JurisdictionId): VisualScene[] {
  return SCENES.filter((scene) => scene.jurisdiction === jurisdiction);
}

export function scriptedClipCount(): number {
  return SCENES.filter((scene) => scene.clip).length;
}
