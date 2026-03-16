import { test, expect } from "@playwright/test";

test.describe("Merchant Lead Monster Calculator + Booking (Marketing)", () => {
  test.skip(
    !process.env.RUN_MERCHANT_LEAD_MONSTER_E2E,
    "Set RUN_MERCHANT_LEAD_MONSTER_E2E=1 to run Merchant Lead Monster marketing E2E",
  );

  test("happy path", async ({ page }) => {
    const marketingBase =
      process.env.MARKETING_BASE_URL || "http://localhost:20000";

    await page.goto(`${marketingBase}/merchant-lead-monster/calculator`);
    await page.fill('input[placeholder="50000.00"]', "50000.00");
    await page.fill('input[placeholder="2.9"]', "2.9");
    await page.getByRole("button", { name: "Calculate Savings" }).click();
    await expect(page.locator("text=Annual savings")).toBeVisible();

    await page.getByRole("button", { name: "Book a Savings Review" }).click();
    await expect(page.locator("text=Request an Appointment")).toBeVisible();

    await page.fill('input[placeholder="Your name"]', "Test User");
    await page.fill('input[placeholder="Email"]', "test@example.com");
    await page.fill('input[placeholder="Business name"]', "Test Biz");
    await page.getByRole("button", { name: "Request Appointment" }).click();

    await expect(page.locator("text=Request Received")).toBeVisible();
  });
});
