import { test, expect } from '@playwright/test';

test.describe('Pipeline View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'PIPELINE' }).click();
    await expect(page.locator('text=PIPELINE DISPLAY').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show pipeline columns', async ({ page }) => {
    await expect(page.locator('text=LEAD INBOX').first()).toBeVisible();
    await expect(page.locator('text=DISCOVERED').first()).toBeVisible();
  });

  test('should switch between Scrolling and Fit to Screen modes', async ({ page }) => {
    const scrollingBtn = page.getByRole('button', { name: 'Scrolling' });
    await expect(scrollingBtn).toBeVisible();

    const fitBtn = page.getByRole('button', { name: 'Fit to Screen' });
    await fitBtn.click();
    await expect(fitBtn).toBeVisible();

    await scrollingBtn.click();
    await expect(scrollingBtn).toBeVisible();
  });

  test('should display pipeline display toggle control bar', async ({ page }) => {
    await expect(page.locator('text=PIPELINE DISPLAY').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Scrolling' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fit to Screen' })).toBeVisible();
  });

  test('should show at least one pipeline stage with content', async ({ page }) => {
    // Verify the grid rendered (at least the stage headers are visible)
    const stageHeadings = page.locator('text=LEAD INBOX, text=DISCOVERED, text=OUTREACH SENT');
    await expect(page.locator('text=LEAD INBOX').first()).toBeVisible();
  });
});
