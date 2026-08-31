import { describe, expect, it } from "vitest";
import { lessonHas3d, lessonsFor, nextLessonAfter } from "@/content/lessons";
import { skillsFor } from "@/content/skills";

describe("micro-lessons", () => {
  it("starts Poland with 2D sign lessons then 3D junction lessons", () => {
    const warning = lessonsFor("PL", "warning-signs");
    expect(warning.length).toBeGreaterThan(0);
    expect(warning[0]?.items.length).toBeGreaterThan(0);
    const scenes = lessonsFor("PL", "uncontrolled");
    expect(scenes.some(lessonHas3d)).toBe(true);
  });

  it("returns the next lesson on the skill path", () => {
    const first = lessonsFor("PL", "warning-signs")[0];
    expect(first).toBeTruthy();
    const next = nextLessonAfter("PL", first!.id);
    expect(next?.id).not.toBe(first!.id);
  });

  it("unlocks a highway unit after lights for Vienna packs", () => {
    expect(skillsFor("PL").some((skill) => skill.id === "highway")).toBe(true);
    expect(skillsFor("RU").some((skill) => skill.id === "highway")).toBe(true);
    expect(skillsFor("UA").some((skill) => skill.id === "highway")).toBe(true);
  });
});
