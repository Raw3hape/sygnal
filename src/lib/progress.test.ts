import { describe, expect, it } from "vitest";
import {
  completedSkillsFor,
  defaultProgress,
  hydratePersistedProgress,
  namespaceLegacySkills,
  skillProgressFor,
  skillProgressKey,
} from "./progress";

describe("skill progress namespacing", () => {
  it("keys progress by jurisdiction", () => {
    expect(skillProgressKey("PL", "warning-signs")).toBe("PL::warning-signs");
    expect(skillProgressKey("DE", "warning-signs")).toBe("DE::warning-signs");
  });

  it("does not let Poland completions unlock Germany", () => {
    const skills = {
      "PL::warning-signs": { completedLessonIds: ["PL-warning-signs-0"], crowns: 1 },
    };
    expect(completedSkillsFor(skills, "PL")["warning-signs"]).toBe(true);
    expect(completedSkillsFor(skills, "DE")["warning-signs"]).toBeUndefined();
    expect(skillProgressFor(skills, "DE", "warning-signs")).toBeUndefined();
  });

  it("still reads un-namespaced legacy keys for the active country", () => {
    const skills = {
      "warning-signs": { completedLessonIds: ["PL-warning-signs-0"], crowns: 1 },
    };
    expect(completedSkillsFor(skills, "PL")["warning-signs"]).toBe(true);
    expect(skillProgressFor(skills, "PL", "warning-signs")?.crowns).toBe(1);
  });

  it("does not let a Poland namespaced skill unlock California via a leftover bare key", () => {
    const skills = {
      "PL::warning-signs": { completedLessonIds: ["PL-warning-signs-0"], crowns: 1 },
      "warning-signs": { completedLessonIds: ["legacy"], crowns: 2 },
    };
    expect(skillProgressFor(skills, "US-CA", "warning-signs")).toBeUndefined();
    expect(completedSkillsFor(skills, "US-CA")["warning-signs"]).toBeUndefined();
  });

  it("migrates legacy keys under the current jurisdiction", () => {
    const migrated = namespaceLegacySkills(
      { "warning-signs": { completedLessonIds: ["x"], crowns: 1 } },
      "US-CA",
    );
    expect(migrated["US-CA::warning-signs"]?.completedLessonIds).toEqual(["x"]);
    expect(migrated["warning-signs"]).toBeUndefined();
  });

  it("drops leftover bare keys once any namespaced skill exists", () => {
    const migrated = namespaceLegacySkills(
      {
        "PL::warning-signs": { completedLessonIds: ["pl"], crowns: 1 },
        "warning-signs": { completedLessonIds: ["legacy"], crowns: 2 },
      },
      "US-CA",
    );
    expect(migrated["PL::warning-signs"]?.completedLessonIds).toEqual(["pl"]);
    expect(migrated["US-CA::warning-signs"]).toBeUndefined();
    expect(migrated["warning-signs"]).toBeUndefined();
  });

  it("keeps XP when rehydrating a version-1 persist blob", () => {
    const next = hydratePersistedProgress({
      ...defaultProgress("PL"),
      xp: 120,
      skills: { "warning-signs": { completedLessonIds: ["x"], crowns: 1 } },
    });
    expect(next.xp).toBe(120);
    expect(next.skills["PL::warning-signs"]?.crowns).toBe(1);
    expect(next.skills["warning-signs"]).toBeUndefined();
  });
});
