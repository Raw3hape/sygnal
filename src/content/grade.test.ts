import { describe, expect, it } from "vitest";
import { gradeItem, hasLessonAnswer } from "@/content/grade";

describe("lesson grading", () => {
  it("accepts the engine order for who-goes-first items", () => {
    const result = gradeItem(
      {
        id: "wgf-1",
        type: "who-goes-first",
        sceneId: "pl-uncontrolled-right",
      },
      ["eastbound", "southbound"],
      "PL",
    );
    expect(result.correct).toBe(true);
  });

  it("rejects a reversed who-goes-first order", () => {
    const result = gradeItem(
      {
        id: "wgf-1",
        type: "who-goes-first",
        sceneId: "pl-uncontrolled-right",
      },
      ["southbound", "eastbound"],
      "PL",
    );
    expect(result.correct).toBe(false);
  });
});

describe("hasLessonAnswer", () => {
  const meaning: Parameters<typeof hasLessonAnswer>[0] = {
    id: "m-1",
    type: "sign-meaning",
    signId: "PL-A-1",
    choices: ["PL-A-1", "PL-A-2"],
    correct: 0,
  };

  it("treats an unpicked multiple-choice item as empty", () => {
    expect(hasLessonAnswer(meaning, null)).toBe(false);
    expect(hasLessonAnswer(meaning, 0)).toBe(true);
  });

  it("accepts false as a real true-false answer", () => {
    const item: Parameters<typeof hasLessonAnswer>[0] = {
      id: "tf-1",
      type: "true-false",
      signId: "PL-A-1",
      prompt: { en: "x", pl: "x", ru: "x" },
      correct: true,
    };
    expect(hasLessonAnswer(item, null)).toBe(false);
    expect(hasLessonAnswer(item, false)).toBe(true);
  });

  it("requires at least one tapped vehicle", () => {
    const item: Parameters<typeof hasLessonAnswer>[0] = {
      id: "wgf-1",
      type: "who-goes-first",
      sceneId: "pl-uncontrolled-right",
    };
    expect(hasLessonAnswer(item, [])).toBe(false);
    expect(hasLessonAnswer(item, ["eastbound"])).toBe(true);
  });
});
