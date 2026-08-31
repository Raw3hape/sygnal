import type { JurisdictionId } from "@/engine/types";
import { assertNever } from "@/engine/geometry";

export const SKILL_IDS = [
  "warning-signs",
  "prohibitory-signs",
  "priority-signs",
  "uncontrolled",
  "lights",
  "roundabout",
  "people",
  "special",
  "highway",
] as const;

export type SkillId = (typeof SKILL_IDS)[number];

export type PathNodeStatus = "ready" | "locked" | "done";

export interface SkillNode {
  id: SkillId;
  prerequisiteIds: SkillId[];
  signCategories?: Array<"warning" | "prohibitory" | "mandatory" | "priority" | "information">;
  sceneIds: string[];
  examWeight: 1 | 2 | 3;
}

const VIENNA_CORE: SkillNode[] = [
  { id: "warning-signs", prerequisiteIds: [], signCategories: ["warning"], sceneIds: [], examWeight: 1 },
  { id: "prohibitory-signs", prerequisiteIds: ["warning-signs"], signCategories: ["prohibitory"], sceneIds: [], examWeight: 1 },
  { id: "priority-signs", prerequisiteIds: ["warning-signs"], signCategories: ["priority"], sceneIds: [], examWeight: 3 },
  { id: "uncontrolled", prerequisiteIds: ["priority-signs"], sceneIds: [], examWeight: 3 },
  { id: "lights", prerequisiteIds: ["uncontrolled"], sceneIds: [], examWeight: 3 },
  { id: "roundabout", prerequisiteIds: ["uncontrolled"], sceneIds: [], examWeight: 2 },
  { id: "people", prerequisiteIds: ["uncontrolled"], sceneIds: [], examWeight: 3 },
  { id: "special", prerequisiteIds: ["lights"], sceneIds: [], examWeight: 2 },
  { id: "highway", prerequisiteIds: ["lights"], signCategories: ["information"], sceneIds: [], examWeight: 1 },
];

function withScenes(
  nodes: SkillNode[],
  scenes: Partial<Record<string, string[]>>,
): SkillNode[] {
  return nodes.map((node) => ({
    ...node,
    sceneIds: scenes[node.id] ?? node.sceneIds,
  }));
}

export const SKILL_GRAPH: Record<JurisdictionId, SkillNode[]> = {
  PL: withScenes(VIENNA_CORE, {
    "priority-signs": ["pl-priority-road", "pl-stop-vs-free"],
    uncontrolled: ["pl-uncontrolled-right", "pl-left-vs-oncoming", "pl-three-cars", "pl-t-junction"],
    lights: ["pl-traffic-light"],
    roundabout: ["pl-roundabout"],
    people: ["pl-pedestrian"],
    special: ["pl-tram", "pl-emergency"],
  }),
  DE: withScenes(VIENNA_CORE, {
    "priority-signs": ["de-priority-road"],
    uncontrolled: ["de-uncontrolled-right"],
    lights: ["pl-traffic-light"],
    roundabout: ["pl-roundabout"],
    people: ["pl-pedestrian"],
    special: ["pl-tram"],
  }),
  "US-CA": [
    { id: "warning-signs", prerequisiteIds: [], signCategories: ["warning"], sceneIds: [], examWeight: 1 },
    { id: "prohibitory-signs", prerequisiteIds: ["warning-signs"], signCategories: ["prohibitory", "mandatory"], sceneIds: [], examWeight: 1 },
    { id: "priority-signs", prerequisiteIds: ["warning-signs"], signCategories: ["priority"], sceneIds: ["us-four-way-arrival", "us-four-way-right", "us-yield-through"], examWeight: 3 },
    { id: "uncontrolled", prerequisiteIds: ["priority-signs"], sceneIds: ["us-four-way-right", "us-left-vs-oncoming"], examWeight: 3 },
    { id: "people", prerequisiteIds: ["uncontrolled"], sceneIds: ["us-pedestrian"], examWeight: 3 },
    { id: "highway", prerequisiteIds: ["priority-signs"], signCategories: ["information"], sceneIds: [], examWeight: 1 },
  ],
  RU: withScenes(VIENNA_CORE, {
    "priority-signs": ["ru-priority", "ru-stop"],
    uncontrolled: ["ru-uncontrolled-right"],
    lights: ["ru-lights"],
    people: ["ru-pedestrian"],
    special: ["ru-tram"],
  }),
  UA: withScenes(VIENNA_CORE, {
    "priority-signs": ["ua-priority"],
    uncontrolled: ["ua-uncontrolled-right"],
    lights: ["ua-lights"],
    people: ["ua-pedestrian"],
    special: ["ua-tram"],
  }),
};

export function skillsFor(jurisdiction: JurisdictionId): SkillNode[] {
  return SKILL_GRAPH[jurisdiction];
}

export function isUnlocked(
  skill: SkillNode,
  completed: Record<string, boolean>,
): boolean {
  return skill.prerequisiteIds.every((id) => completed[id]);
}

export function pathNodeStatus(
  unlocked: boolean,
  completedLessons: number,
  totalLessons: number,
): PathNodeStatus {
  if (!unlocked) {
    return "locked";
  }
  if (totalLessons > 0 && completedLessons >= totalLessons) {
    return "done";
  }
  return "ready";
}

export function pathStatusLabelKey(status: PathNodeStatus): "unlocked" | "locked" | "skillDone" {
  switch (status) {
    case "ready":
      return "unlocked";
    case "locked":
      return "locked";
    case "done":
      return "skillDone";
    default:
      return assertNever(status);
  }
}
