import type { Card } from "ts-fsrs";
import type { JurisdictionId } from "@/engine/types";
import type { QualityPreference } from "@/lib/quality";

export type AttentionMode = "focus" | "play";

export interface SkillProgress {
  completedLessonIds: string[];
  crowns: number;
}

export interface DrivingDays {
  count: number;
  lastIsoDate: string | null;
  paused: boolean;
}

export interface SerializedCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
}

export interface ProgressState {
  jurisdictionId: JurisdictionId;
  attentionMode: AttentionMode;
  qualityOverride: QualityPreference;
  xp: number;
  collectedSignIds: string[];
  skills: Record<string, SkillProgress>;
  cards: Record<string, SerializedCard>;
  drivingDays: DrivingDays;
  onboardingComplete: boolean;
}

export const defaultProgress = (jurisdictionId: JurisdictionId = "PL"): ProgressState => ({
  jurisdictionId,
  attentionMode: "focus",
  qualityOverride: "auto",
  xp: 0,
  collectedSignIds: [],
  skills: {},
  cards: {},
  drivingDays: { count: 0, lastIsoDate: null, paused: false },
  onboardingComplete: false,
});

export function serializeCard(card: Card): SerializedCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review?.toISOString(),
  };
}

export function deserializeCard(card: SerializedCard): Card {
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  };
}

export function todayIso(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function bumpDrivingDays(days: DrivingDays, now = new Date()): DrivingDays {
  if (days.paused) {
    return days;
  }
  const today = todayIso(now);
  if (days.lastIsoDate === today) {
    return days;
  }
  const yesterday = todayIso(new Date(now.getTime() - 86400000));
  const continued = days.lastIsoDate === yesterday;
  return {
    count: continued ? days.count + 1 : 1,
    lastIsoDate: today,
    paused: false,
  };
}

export function skillProgressKey(jurisdictionId: JurisdictionId, skillId: string): string {
  return `${jurisdictionId}::${skillId}`;
}

function hasNamespacedSkills(skills: Record<string, SkillProgress>): boolean {
  return Object.keys(skills).some((key) => key.includes("::"));
}

export function namespaceLegacySkills(
  skills: Record<string, SkillProgress>,
  jurisdictionId: JurisdictionId,
): Record<string, SkillProgress> {
  const next: Record<string, SkillProgress> = {};
  for (const [key, value] of Object.entries(skills)) {
    next[key.includes("::") ? key : skillProgressKey(jurisdictionId, key)] = value;
  }
  return next;
}

export function skillProgressFor(
  skills: Record<string, SkillProgress>,
  jurisdictionId: JurisdictionId,
  skillId: string,
): SkillProgress | undefined {
  const namespaced = skills[skillProgressKey(jurisdictionId, skillId)];
  if (namespaced) {
    return namespaced;
  }
  if (hasNamespacedSkills(skills)) {
    return undefined;
  }
  return skills[skillId];
}

export function completedSkillsFor(
  skills: Record<string, SkillProgress>,
  jurisdictionId: JurisdictionId,
): Record<string, boolean> {
  const prefix = `${jurisdictionId}::`;
  const completed: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(skills)) {
    if (key.startsWith(prefix)) {
      completed[key.slice(prefix.length)] = value.completedLessonIds.length > 0;
    }
  }
  if (hasNamespacedSkills(skills)) {
    return completed;
  }
  for (const [key, value] of Object.entries(skills)) {
    if (!key.includes("::")) {
      completed[key] = value.completedLessonIds.length > 0;
    }
  }
  return completed;
}
