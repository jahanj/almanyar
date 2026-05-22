import { test, expect } from '@playwright/test';

const PAGES = ['/fa', '/fa/guide', '/fa/germany-visa/visametric', '/fa/how-it-works'];

test.describe('LEGAL-05 — footer independence disclosure', () => {
  for (const path of PAGES) {
    test(`${path} shows footer disclosure line`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const disclosure = page.getByTestId('footer-independence');
      await expect(disclosure).toBeVisible();
      await expect(disclosure).toContainText('آلمانیار یک منبع اطلاع‌رسانی مستقل است');
    });
  }
});
