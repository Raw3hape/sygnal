import { describe, expect, it } from "vitest";
import { gradeItem } from "@/content/grade";

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
