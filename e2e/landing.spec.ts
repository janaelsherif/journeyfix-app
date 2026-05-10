import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads and shows hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/Schwachstellen|weak points/i);
  });

  test("navigates to scan from CTA", async ({ page }) => {
    await page.goto("/");
    await page.click('a:has-text("Kostenlos testen"), a:has-text("Try free")');
    await expect(page).toHaveURL(/\/scan/);
  });

  test("navigates to scan from nav", async ({ page }) => {
    await page.goto("/");
    await page.click('a:has-text("Prüfung starten"), a:has-text("Start analysis")');
    await expect(page).toHaveURL(/\/scan/);
  });

  test("scrolls to how-it-works", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="#how-it-works"]');
    await expect(page.locator("#how-it-works")).toBeVisible();
  });

  test("language switcher opens dropdown", async ({ page }) => {
    await page.goto("/");
    await page.click('button:has-text("Deutsch"), button:has-text("English")');
    await expect(page.getByRole("option").first()).toBeVisible();
  });

  test("FAQ section exists", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#faq")).toBeVisible();
  });
});
