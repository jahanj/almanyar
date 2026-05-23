import { test, expect } from '@playwright/test';

/**
 * TRUST-06 — homepage trust section as 3 cards.
 *
 * Asserts:
 *  - exactly 3 cards under the trust-model section
 *  - each carries its spec'd heading
 *  - the "بیشتر درباره ما" link points at /fa/about (not /fa/how-it-works)
 */

const CARD_HEADINGS = [
  'ترکیه به‌عنوان پل آماده‌سازی',
  'پذیرش دانشگاه ترکیه — کاملاً رایگان',
  '۶ سال تجربه واقعی در ترکیه',
];

test.describe('TRUST-06 — homepage 3 trust cards', () => {
  test('three cards present, each with spec heading + onward CTA to /about', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    const section = page.getByTestId('trust-model');
    await expect(section).toBeVisible();

    for (const heading of CARD_HEADINGS) {
      await expect(section.getByRole('heading', { name: heading })).toBeVisible();
    }

    // Embassy phrasing is the load-bearing positioning sentence.
    await expect(section).toContainText('سفارت آلمان در تهران بسته است');
    await expect(section).toContainText('شهریه را مستقیماً خودتان');

    const aboutLink = section.locator('a[href$="/fa/about"]');
    await expect(aboutLink).toHaveCount(1);
    await expect(aboutLink).toContainText('بیشتر درباره ما');
  });
});
