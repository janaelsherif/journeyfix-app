import { test, expect } from "@playwright/test";

test.describe("Report page", () => {
  test("shows no report state when empty", async ({ page }) => {
    await page.goto("/report");
    await expect(page.getByRole("heading", { name: /Kein Bericht gefunden|No report found/ })).toBeVisible();
    await expect(page.locator('a:has-text("Prüfung starten"), a:has-text("Start analysis")')).toBeVisible();
  });

  test("report by ID loads from API", async ({ page }) => {
    await page.route("**/api/report/*", async (route) => {
      const id = route.request().url().split("/").pop()?.split("?")[0];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id,
          websiteUrl: "https://example.ch",
          profession: "DENTIST",
          canton: "ZH",
          overallScore: 78,
          isPremium: false,
          useCaseResults: [
            { useCaseId: "1", useCaseName: "Phone", score: 70, severity: "medium", frictionPoints: [], briefRemedy: "Add phone" },
          ],
          statusShiftAnalysis: "## Test\nContent",
          fiveAngleAnalysis: "## Test\nContent",
        }),
      });
    });

    await page.goto("/report/e2e-report-789");
    await expect(page.getByRole("heading", { name: /Prüfbericht|Analysis report/ })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=78')).toBeVisible();
  });

  test("report by ID shows 404 when not found", async ({ page }) => {
    await page.route("**/api/report/*", (route) =>
      route.fulfill({ status: 404 })
    );

    await page.goto("/report/nonexistent-id");
    await expect(page.getByRole("heading", { name: /Kein Bericht gefunden|No report found/ })).toBeVisible({ timeout: 10000 });
  });

  test("share and PDF buttons visible on report", async ({ page }) => {
    await page.route("**/api/report/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "share-test",
          websiteUrl: "https://example.ch",
          profession: "DENTIST",
          canton: "ZH",
          overallScore: 80,
          isPremium: false,
          useCaseResults: [
            { useCaseId: "1", useCaseName: "Test", score: 80, severity: "low", frictionPoints: [], briefRemedy: "OK" },
          ],
          statusShiftAnalysis: "Test",
          fiveAngleAnalysis: "Test",
        }),
      });
    });

    await page.goto("/report/share-test");
    await expect(page.getByText(/Bericht teilen|Share report/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/PDF herunterladen|Download PDF/)).toBeVisible();
  });
});
