import { test, expect } from '@playwright/test';

test.describe('Email Campaigns View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'EMAILCAMPAIGNS' }).click();
    await page.waitForTimeout(1000);
  });

  test('should display email campaigns section', async ({ page }) => {
    // The view renders email sequences
    await expect(page.locator('text=Email Sequences').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show New Email Sequence button', async ({ page }) => {
    await expect(page.locator('text=New Email Sequence').first()).toBeVisible({ timeout: 10000 });
  });

  test('should open sequence creation modal when create button clicked', async ({ page }) => {
    await page.locator('text=New Email Sequence').first().click();
    // Modal should appear — look for sequence-related input
    await expect(page.locator('input, textarea').first()).toBeVisible({ timeout: 5000 });
  });

  test('should allow typing a sequence name', async ({ page }) => {
    await page.locator('text=New Email Sequence').first().click();
    const input = page.locator('input[type="text"], input:not([type])').first();
    await input.fill('Test E2E Sequence');
    await expect(input).toHaveValue('Test E2E Sequence');
  });
});
