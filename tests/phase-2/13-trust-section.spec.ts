import { test, expect } from '@playwright/test';

test.describe('POSITIONING-02 — homepage trust section', () => {
  test('renders four trust bullets + CTA to /how-it-works', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });

    const section = page.getByTestId('trust-model');
    await expect(section).toBeVisible();

    // All four explicit claims.
    for (const phrase of [
      'پذیرش دانشگاه ترکیه: کاملاً رایگان',
      'شهریه دانشگاه: مستقیم به حساب دانشگاه',
      'پرداخت خدمات استقرار: فقط بعد از قرارداد',
      'مسیر آلمان: همراهی شفاف',
    ]) {
      await expect(section).toContainText(phrase);
    }

    // CTA link to the how-it-works trust page.
    const link = section.locator('a[href$="/fa/how-it-works"]');
    await expect(link).toHaveCount(1);
  });
});
