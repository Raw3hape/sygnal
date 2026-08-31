import { expect, test } from "@playwright/test";
import { gotoSeeded } from "./helpers";

test.describe("onboarding and learn", () => {
  test("fresh English onboarding shows language, jurisdictions, and disclaimer", async ({
    page,
  }) => {
    await page.goto("/en");
    const main = page.getByRole("main");

    await expect(
      main.getByRole("heading", { name: "Pick the rules of the road" }),
    ).toBeVisible();
    await expect(main.getByRole("link", { name: "EN", exact: true })).toBeVisible();
    await expect(main.getByRole("link", { name: "PL", exact: true })).toBeVisible();
    await expect(main.getByRole("link", { name: "RU", exact: true })).toBeVisible();

    await expect(main.getByRole("button", { name: "Poland" })).toBeVisible();
    await expect(main.getByRole("button", { name: "Germany" })).toBeVisible();
    await expect(main.getByRole("button", { name: "California, USA" })).toBeVisible();
    await expect(main.getByRole("button", { name: "Russia" })).toBeVisible();
    await expect(main.getByRole("button", { name: "Ukraine" })).toBeVisible();

    await expect(page.getByRole("contentinfo")).toContainText(
      "does not replace a driving school or the official exam",
    );
  });

  test("choosing Poland lands on the home hub", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Poland" }).click();

    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { name: "Sygnal" })).toBeVisible();
    await expect(main.getByText("Poland", { exact: true })).toBeVisible();
    await expect(main.getByRole("link", { name: "Learn", exact: true })).toBeVisible();
    await expect(main.getByRole("link", { name: "3D town" })).toBeVisible();
  });

  test("seeded learn path shows today's goal and unlocks warning signs", async ({
    page,
  }) => {
    await gotoSeeded(page, "/en/learn", { onboardingComplete: true, jurisdictionId: "PL" });

    const main = page.getByRole("main");
    await expect(main.getByText("Today's goal: one lesson")).toBeVisible();

    const warning = main.getByRole("listitem").filter({ hasText: "Warning signs" });
    await expect(warning.getByText("Ready", { exact: true })).toBeVisible();

    const prohibitory = main.getByRole("listitem").filter({ hasText: "Prohibitory signs" });
    await expect(prohibitory.getByText("Locked", { exact: true })).toBeVisible();

    await expect(main.getByRole("link", { name: "Start lesson 1", exact: true })).toHaveAttribute(
      "href",
      "/en/lesson/PL-warning-signs-0",
    );
  });

  test("first warning-signs item grades Dangerous right curve as correct", async ({
    page,
  }) => {
    await gotoSeeded(page, "/en/learn", { onboardingComplete: true, jurisdictionId: "PL" });
    await page.getByRole("link", { name: "Start lesson 1", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/lesson\/PL-warning-signs-0$/);

    await expect(page.getByLabel("Dangerous right curve")).toBeVisible();
    await page.getByRole("button", { name: "Dangerous right curve" }).click();
    await page.getByRole("button", { name: "Check", exact: true }).click();

    await expect(page.getByText("Correct", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
  });
});
