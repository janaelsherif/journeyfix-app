import { test, expect } from "@playwright/test";

test.describe("Scan page", () => {
  test("loads scan form", async ({ page }) => {
    await page.goto("/scan");
    await expect(page.locator('input[id="websiteUrl"]')).toBeVisible();
    await expect(page.locator('select[id="profession"]')).toBeVisible();
    await expect(page.locator('select[id="canton"]')).toBeVisible();
  });

  test("shows validation for empty submit", async ({ page }) => {
    await page.goto("/scan");
    await page.click('button[type="submit"]');
    await expect(page.locator('input[id="websiteUrl"]:invalid')).toBeVisible();
  });

  test("submits form and shows loading state", async ({ page }) => {
    await page.goto("/scan");

    await page.route("**/api/scan", async (route) => {
      await new Promise((r) => setTimeout(r, 800));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          scan: {
            id: "test-scan-123",
            websiteUrl: "https://example.ch",
            profession: "DENTIST",
            canton: "ZH",
            overallScore: 75,
            useCaseResults: [
              { useCaseId: "1", useCaseName: "Test", score: 80, severity: "low", frictionPoints: [], briefRemedy: "Test" },
            ],
            statusShiftAnalysis: "Test analysis",
            fiveAngleAnalysis: "Test analysis",
          },
        }),
      });
    });

    await page.fill('input[id="websiteUrl"]', "https://www.zahnarzt-zuerich.ch");
    await page.selectOption('select[id="profession"]', "DENTIST");
    await page.selectOption('select[id="canton"]', "ZH");
    await page.click('button[type="submit"]');

    await expect(page.getByText(/Prüfung läuft|Analyzing|Reviewing|Website wird geprüft/).first()).toBeVisible({ timeout: 2000 });
  });

  test("redirects to report on success", async ({ page }) => {
    await page.goto("/scan");

    await page.route("**/api/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          scan: {
            id: "e2e-scan-456",
            websiteUrl: "https://example.ch",
            profession: "DENTIST",
            canton: "ZH",
            overallScore: 72,
            useCaseResults: [
              { useCaseId: "1", useCaseName: "Phone", score: 70, severity: "medium", frictionPoints: [], briefRemedy: "Add phone" },
              { useCaseId: "2", useCaseName: "Email", score: 80, severity: "low", frictionPoints: [], briefRemedy: "OK" },
            ],
            statusShiftAnalysis: "## Analysis\nContent here",
            fiveAngleAnalysis: "## 5-Angle\nContent here",
          },
        }),
      });
    });

    await page.fill('input[id="websiteUrl"]', "https://example.ch");
    await page.selectOption('select[id="profession"]', "DENTIST");
    await page.selectOption('select[id="canton"]', "ZH");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/report\/e2e-scan-456/, { timeout: 15000 });
  });

  test("shows error on API failure", async ({ page }) => {
    await page.goto("/scan");

    await page.route("**/api/scan", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal error" }),
      })
    );

    await page.fill('input[id="websiteUrl"]', "https://example.ch");
    await page.selectOption('select[id="profession"]', "DENTIST");
    await page.selectOption('select[id="canton"]', "ZH");
    await page.click('button[type="submit"]');

    await expect(page.locator("p.font-medium").filter({ hasText: /Internal|error|Fehler/ })).toBeVisible({ timeout: 10000 });
  });
});
