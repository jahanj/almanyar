import { test, expect } from '@playwright/test';

const REQUIRED_PHRASES = [
  'چه اطلاعاتی جمع می‌کنیم',
  'با هیچ شخص ثالثی به‌جز سرویس‌های فنی لازم',
  'حقوق شما',
  'این سایت از کوکی‌های ضروری برای عملکرد استفاده می‌کند',
];

test.describe('LEGAL-02 — /fa/privacy', () => {
  test('page renders with required content + contact email', async ({ page, request }) => {
    expect((await request.get('/fa/privacy')).status()).toBe(200);
    await page.goto('/fa/privacy', { waitUntil: 'domcontentloaded' });
    for (const phrase of REQUIRED_PHRASES) {
      await expect(page.locator('body')).toContainText(phrase);
    }
    // Contact email — must be the canonical contact@ alias, not info@.
    // Owner must confirm this alias is live before privacy page is deployed
    // (flagged in PHASE-2-REPORT.md).
    await expect(page.locator('body')).toContainText('contact@almanyar.com');
    const infoCount = await page.locator('body', { hasText: 'info@almanyar.com' }).count();
    expect(infoCount, 'privacy page must not reference info@ (replaced with contact@)').toBe(0);
  });
});
