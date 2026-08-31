import { type Page, expect } from "@playwright/test";

export interface SeedProgress {
  jurisdictionId?: "PL" | "DE" | "US-CA" | "RU" | "UA";
  attentionMode?: "focus" | "play";
  qualityOverride?: "auto" | "low" | "mid" | "high";
  onboardingComplete?: boolean;
  xp?: number;
  skills?: Record<string, { completedLessonIds: string[]; crowns: number }>;
}

export function persistPayload(seed: SeedProgress = {}): string {
  return JSON.stringify({
    state: {
      jurisdictionId: seed.jurisdictionId ?? "PL",
      attentionMode: seed.attentionMode ?? "focus",
      qualityOverride: seed.qualityOverride ?? "low",
      xp: seed.xp ?? 0,
      collectedSignIds: [],
      skills: seed.skills ?? {},
      cards: {},
      drivingDays: { count: 0, lastIsoDate: null, paused: false },
      onboardingComplete: seed.onboardingComplete ?? true,
    },
    version: 0,
  });
}

export async function seedProgress(page: Page, seed: SeedProgress = {}): Promise<void> {
  const payload = persistPayload(seed);
  await page.addInitScript((value) => {
    window.localStorage.setItem("sygnal-progress", value);
  }, payload);
}

export async function gotoSeeded(page: Page, path: string, seed: SeedProgress = {}): Promise<void> {
  await seedProgress(page, seed);
  await page.goto(path);
  await expect(page.getByRole("link", { name: "Sygnal" })).toBeVisible();
}

export async function waitForCanvas(page: Page): Promise<void> {
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible({ timeout: 20_000 });
}
