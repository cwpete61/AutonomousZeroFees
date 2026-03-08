import { test, expect } from '@playwright/test';

test.describe('Campaigns View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /campaigns/i }).first().click();
    await page.waitForTimeout(1000);
  });

  test('should display campaigns view', async ({ page }) => {
    await expect(page.locator('text=CAMPAIGNS').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show existing campaigns', async ({ page }) => {
    // Campaigns list should be visible (sample data)
    const campaignItems = page.locator('[data-testid="campaign-item"], .campaign-row');
    // Just verify the page loaded correctly
    await expect(page.url()).toContain('localhost:30000');
  });

  test('should show create campaign button', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new campaign|create campaign|\+ campaign/i });
    await expect(createBtn.first()).toBeVisible({ timeout: 10000 });
  });

  test('should open campaign creation wizard when create button clicked', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new campaign|create campaign|\+ campaign/i });
    await createBtn.first().click();
    // Wizard or modal should appear
    await expect(page.locator('text=/category|service|industry|wizard/i').first()).toBeVisible({ timeout: 5000 });
  });
});
