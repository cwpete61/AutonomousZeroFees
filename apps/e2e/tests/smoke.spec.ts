import { test, expect } from '@playwright/test';

test.describe('Dashboard Smoke Tests', () => {
  test('should load the dashboard homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Orbis Outreach - BPS')).toBeVisible({ timeout: 15000 });
  });

  test('should display the main navigation', async ({ page }) => {
    await page.goto('/');
    const navItems = ['CAMPAIGNS', 'AGENTS', 'PIPELINE', 'CRM', 'ANALYTICS'];
    for (const item of navItems) {
      await expect(page.getByRole('button', { name: item }).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display the summary stats cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Total Leads')).toBeVisible({ timeout: 10000 });
    // Use first() to handle multiple elements with similar text
    await expect(page.locator('text=Conversion').first()).toBeVisible();
    await expect(page.locator('text=Revenue').first()).toBeVisible();
  });

  test('should toggle dark/light theme', async ({ page }) => {
    await page.goto('/');
    // Theme button is a button with emoji
    const themeBtn = page.locator('header button').last();
    await expect(themeBtn).toBeVisible({ timeout: 10000 });
    await themeBtn.click();
    await expect(page.locator('text=Orbis Outreach - BPS')).toBeVisible();
  });

  test('should navigate to all main views', async ({ page }) => {
    await page.goto('/');
    const views = ['PIPELINE', 'CRM', 'AGENTS', 'ANALYTICS'];
    for (const view of views) {
      await page.getByRole('button', { name: view }).click();
      await page.waitForTimeout(300);
    }
    // Just verify no crashes during navigation
    await expect(page.locator('text=Orbis Outreach - BPS')).toBeVisible();
  });
});
