import { describe, expect, it } from "vitest";
import { createEmptyCard, Rating } from "ts-fsrs";
import { reviewCard } from "@/lib/scheduler";

describe("FSRS scheduler wrapper", () => {
  it("schedules a successful review later than a failed one", () => {
    const card = createEmptyCard(new Date("2026-01-01T00:00:00Z"));
    const good = reviewCard(card, Rating.Good, new Date("2026-01-01T00:00:00Z"));
    const again = reviewCard(card, Rating.Again, new Date("2026-01-01T00:00:00Z"));
    expect(good.due.getTime()).toBeGreaterThan(again.due.getTime());
  });
});
