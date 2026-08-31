import { describe, expect, it } from "vitest";
import {
  completedSkillsFor,
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
});
