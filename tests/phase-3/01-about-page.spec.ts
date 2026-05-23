import { test, expect } from '@playwright/test';

/**
 * TRUST-01 — /fa/about
 *
 * Personal-introduction trust page. Verifies:
 *  - page returns 200
 *  - greeting + key bio sentences render
 *  - all four major sections (intro / why / services / principles) present
 *  - owner photo image element loads with alt text
 *  - WhatsApp CTA present, points at wa.me with prefilled message
 *  - "درباره ما" link is in the header nav
 */

test.describe('TRUST-01 — /fa/about', () => {
  test('renders bio, all sections, photo, and WhatsApp CTA', async ({ page, request }) => {
    expect((await request.get('/fa/about')).status()).toBe(200);
    await page.goto('/fa/about', { waitUntil: 'domcontentloaded' });

    // Greeting + headline phrases
    for (const phrase of [
      'سلام، من محمد جهانبانی هستم',
      'شش سال است که در ترکیه زندگی می‌کنم',
      'بیش از بیست دانشجوی ایرانی',
      'سفارت آلمان در تهران سال‌ها است که بسته یا با محدودیت‌های جدی کار می‌کند',
      'اخذ پذیرش از دانشگاه‌های خصوصی ترکیه — به‌صورت کاملاً رایگان',
      'هیچ مشاور صادقی نمی‌تواند نتیجه این مراحل را تضمین کند',
      'اصول کاری من',
    ]) {
      await expect(page.locator('body')).toContainText(phrase);
    }

    // Photo present with correct alt
    const photo = page.locator('img[alt="محمد جهانبانی، بنیان‌گذار آلمانیار"]');
    await expect(photo).toBeVisible();

    // WhatsApp CTA with prefilled message
    const wa = page.locator('a[href*="wa.me/905067708295"]').first();
    await expect(wa).toBeVisible();
    const href = await wa.getAttribute('href');
    expect(href).toContain('text=');
  });

  test('"درباره ما" appears in the header nav', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    const link = page.locator('header a[href$="/fa/about"]');
    await expect(link).toHaveCount(1);
  });
});
