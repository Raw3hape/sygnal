import { expect, test } from "@playwright/test";
import { gotoSeeded } from "./helpers";

test.describe("exam and i18n", () => {
  test("exam has 32 questions, yes/no controls, and no countdown timer", async ({ page }) => {
    await gotoSeeded(page, "/en/exam", {
      onboardingComplete: true,
      jurisdictionId: "PL",
    });

    await expect(page.getByRole("heading", { name: "Exam" })).toBeVisible();
    await expect(page.getByText("32 questions")).toBeVisible();
    await expect(page.getByText("68 of 74")).toBeVisible();
    await expect(page.getByText("1 / 32")).toBeVisible();
    await expect(page.getByRole("button", { name: "Yes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "No" })).toBeVisible();
    await expect(page.getByRole("timer")).toHaveCount(0);

    await page.getByRole("button", { name: "Yes" }).click();

    await expect(page.getByText("2 / 32")).toBeVisible();
    await expect(page.getByRole("button", { name: "Yes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "No" })).toBeVisible();
    await expect(page.getByRole("timer")).toHaveCount(0);
  });

  test("settings jurisdiction switch changes the learn pack", async ({ page }) => {
    await gotoSeeded(page, "/en/settings", {
      onboardingComplete: true,
      jurisdictionId: "PL",
    });

    await expect(page.getByRole("button", { name: "Poland" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Germany" })).toBeVisible();
    await expect(page.getByRole("button", { name: "California, USA" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Russia" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ukraine" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Focus" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Play" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Auto" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Low" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Medium" })).toBeVisible();
    await expect(page.getByRole("button", { name: "High" })).toBeVisible();

    await page.getByRole("button", { name: "California, USA" }).click();
    await page.getByRole("link", { name: "Learn" }).click();

    await expect(page.getByRole("heading", { name: "Learn" })).toBeVisible();
    await expect(page.getByText("Warning signs", { exact: true })).toBeVisible();
    await expect(page.getByText("People on the road", { exact: true })).toBeVisible();
    await expect(page.getByText("Trams and emergency", { exact: true })).toHaveCount(0);

    await page.getByRole("link", { name: "Start lesson 1", exact: true }).click();
    await expect(page).toHaveURL(/US-CA-warning-signs/);
  });

  test("Polish UI keeps a California jurisdiction", async ({ page }) => {
    await gotoSeeded(page, "/pl", {
      onboardingComplete: true,
      jurisdictionId: "US-CA",
    });

    await expect(page.getByRole("heading", { name: "Sygnal" })).toBeVisible();
    await expect(page.getByText("Kalifornia, USA")).toBeVisible();
    await expect(page.getByRole("link", { name: "Nauka" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Egzamin" })).toBeVisible();
    await expect(page.getByText(/szkoły jazdy/)).toBeVisible();
    await expect(page.getByText(/egzaminu/)).toBeVisible();
  });

  test("Russian learn UI keeps the Polish lesson pack", async ({ page }) => {
    await gotoSeeded(page, "/ru/learn", {
      onboardingComplete: true,
      jurisdictionId: "PL",
    });

    await expect(page.getByRole("heading", { name: "Учёба" })).toBeVisible();
    await expect(page.getByText("Предупреждающие знаки")).toBeVisible();
    await expect(page.getByText("Цель на сегодня")).toBeVisible();

    const firstLesson = page.getByRole("link", { name: "Начать урок 1", exact: true });
    await expect(firstLesson).toBeVisible();
    await expect(firstLesson).toHaveAttribute("href", /PL-warning-signs/);
  });
});
