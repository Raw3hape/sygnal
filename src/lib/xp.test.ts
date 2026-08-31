import { describe, expect, it } from "vitest";
import { addXp, levelFromXp } from "@/lib/xp";

describe("xp", () => {
  it("starts learners at level 1 and levels up every 100 xp", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
  });

  it("awards lesson xp without subtracting for mistakes", () => {
    const next = addXp(40, { correct: 7, total: 10 });
    expect(next).toBe(40 + 70 + 10);
  });
});
