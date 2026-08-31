import { expect, test, type Page } from "@playwright/test";
import { gotoSeeded, waitForCanvas } from "./helpers";

const seed = {
  onboardingComplete: true,
  jurisdictionId: "PL" as const,
  attentionMode: "focus" as const,
  qualityOverride: "low" as const,
};

/** HTML labels from the 3D scene can lag behind the canvas element. */
async function waitForOverlayButton(page: Page, name: string) {
  const button = page.getByRole("button", { name, exact: true });
  await expect(button).toBeVisible({ timeout: 20_000 });
  return button;
}

test("who-goes-first 3D: yield to the right at uncontrolled junction", async ({ page }) => {
  await gotoSeeded(page, "/en/lesson/PL-uncontrolled-scenes", seed);

  await expect(page.getByText("Tap the vehicles in the order they may go.")).toBeVisible();
  await expect(page.getByText("Nobody has a priority sign. Who goes first?")).toBeVisible();

  await waitForCanvas(page);

  const eastbound = await waitForOverlayButton(page, "East car");
  const southbound = await waitForOverlayButton(page, "South car");

  await eastbound.click({ force: true });
  await southbound.click({ force: true });
  await expect(page.getByText("East car → South car")).toBeVisible();

  await page.getByRole("button", { name: "Check" }).click();

  await expect(page.getByText("Correct", { exact: true })).toBeVisible();
  await expect(page.getByText(/Yield to the vehicle on the right/)).toBeVisible();
});

test("hub town: Warning signs opens first lesson", async ({ page }) => {
  await gotoSeeded(page, "/en/hub", seed);

  await expect(page.getByRole("heading", { name: "3D town" })).toBeVisible();
  await waitForCanvas(page);

  const warningSigns = await waitForOverlayButton(page, "Warning signs");
  await warningSigns.click({ force: true });

  await expect(page).toHaveURL(/\/en\/lesson\/PL-warning-signs-0/);
});

test("drive park: canvas loads without crashing", async ({ page }) => {
  await gotoSeeded(page, "/en/drive", seed);

  await expect(page.getByRole("heading", { name: "Drive park" })).toBeVisible();
  await expect(page.getByText(/WASD/)).toBeVisible();
  await waitForCanvas(page);

  await expect(page.getByText("Application error")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Drive park" })).toBeVisible();
});
