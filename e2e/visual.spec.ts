import { expect, test, type Page } from "@playwright/test";
import { gotoSeeded, waitForCanvas } from "./helpers";

const plSeeded = {
  onboardingComplete: true,
  jurisdictionId: "PL",
  attentionMode: "focus",
  qualityOverride: "low",
} as const;

const usCaSeeded = {
  onboardingComplete: true,
  jurisdictionId: "US-CA",
  attentionMode: "focus",
  qualityOverride: "low",
} as const;

async function beforeShot(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => document.fonts.ready);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("onboarding-en", async ({ page }) => {
  await page.goto("/en", { waitUntil: "load" });
  await expect(page.getByRole("heading", { name: "Pick the rules of the road" })).toBeVisible();
  await beforeShot(page);
  await expect(page).toHaveScreenshot("onboarding.png", { fullPage: true });
});

test("home-pl", async ({ page }) => {
  await gotoSeeded(page, "/en", plSeeded);
  await expect(page.getByRole("heading", { name: "Sygnal" })).toBeVisible();
  await expect(page.getByText("Poland")).toBeVisible();
  await beforeShot(page);
  await expect(page).toHaveScreenshot("home.png", { fullPage: true });
});

test("learn-pl", async ({ page }) => {
  await gotoSeeded(page, "/en/learn", plSeeded);
  await expect(page.getByRole("heading", { name: "Learn" })).toBeVisible();
  await beforeShot(page);
  await expect(page).toHaveScreenshot("learn.png", { fullPage: true });
});

test("settings", async ({ page }) => {
  await gotoSeeded(page, "/en/settings", plSeeded);
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await beforeShot(page);
  await expect(page).toHaveScreenshot("settings.png", { fullPage: true });
});

test("exam", async ({ page }) => {
  await gotoSeeded(page, "/en/exam", plSeeded);
  await expect(
    page.getByRole("img").or(page.getByLabel("Dangerous right curve")).first(),
  ).toBeVisible();
  await beforeShot(page);
  await expect(page).toHaveScreenshot("exam.png", { fullPage: true });
});

test("lesson-2d", async ({ page }) => {
  await gotoSeeded(page, "/en/lesson/PL-warning-signs-0", plSeeded);
  await expect(page.locator("main").getByRole("button").nth(1)).toBeVisible();
  await beforeShot(page);
  await expect(page).toHaveScreenshot("lesson-2d.png", { fullPage: true });
});

test("lesson-3d", async ({ page }) => {
  await gotoSeeded(page, "/en/lesson/PL-uncontrolled-scenes", plSeeded);
  await waitForCanvas(page);
  await beforeShot(page);
  await expect(page).toHaveScreenshot("lesson-3d.png", {
    fullPage: true,
    // Magenta fill is Playwright's mask, not a missing texture.
    mask: [page.locator("canvas")],
  });
});

test("hub", async ({ page }) => {
  await gotoSeeded(page, "/en/hub", plSeeded);
  await waitForCanvas(page);
  await beforeShot(page);
  await expect(page).toHaveScreenshot("hub.png", {
    fullPage: true,
    mask: [page.locator("canvas")],
  });
});

test("polish-home", async ({ page }) => {
  await gotoSeeded(page, "/pl", usCaSeeded);
  await expect(page.getByRole("heading", { name: "Sygnal" })).toBeVisible();
  await expect(page.getByText("Kalifornia, USA")).toBeVisible();
  await beforeShot(page);
  await expect(page).toHaveScreenshot("home-pl-usca.png", { fullPage: true });
});
