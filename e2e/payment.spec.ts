import { test, expect } from "@playwright/test";

test.describe("Payment placeholder page (no Stripe)", () => {
  test("shows message without scanId and links to scan / pricing", async ({ page }) => {
    await page.goto("/payment");
    await expect(
      page.getByRole("heading", { name: /Vollbericht freischalten|Unlock full report/ })
    ).toBeVisible();
    await expect(
      page.getByText(/Berichts-ID|report ID|needs the report ID/i)
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Kostenlos testen|Try free/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Preise|Leistungen|Pricing|features/i })
    ).toBeVisible();
  });

  test("shows selected tier and back to report when scanId present", async ({ page }) => {
    const scanId = "e2e-payment-scan-1";
    await page.goto(`/payment?scanId=${encodeURIComponent(scanId)}&tier=BASIC`);
    await expect(page.getByText(/Demnächst|Coming soon|coming soon/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Vollbericht freischalten|Unlock full report/ })
    ).toBeVisible();
    await expect(
      page.getByText(/Aktionsbericht|Action report/i)
    ).toBeVisible();
    await expect(page.getByText(scanId)).toBeVisible();
    const back = page.getByRole("link", { name: /Zurück zum Bericht|Back to report/i });
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute("href", `/report/${scanId}`);
  });

  test("Advanced tier label when tier=ADVANCED", async ({ page }) => {
    await page.goto("/payment?scanId=test-adv&tier=ADVANCED");
    await expect(
      page.getByText(/Professioneller Bericht|Professional report/i)
    ).toBeVisible();
  });

  test("api/checkout redirects to payment with same query", async ({ page }) => {
    const scanId = "redirect-test";
    const response = await page.goto(`/api/checkout?scanId=${encodeURIComponent(scanId)}&tier=BASIC`);
    expect(response?.status()).toBeLessThan(400);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/payment");
    expect(url.searchParams.get("scanId")).toBe(scanId);
    expect(url.searchParams.get("tier")).toBe("BASIC");
  });
});
