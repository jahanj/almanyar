import { test, expect } from '@playwright/test';

/**
 * Phase-8F — homepage trim. Process / Education / TurkeyResidence /
 * Testimonials sections moved off the homepage into their dedicated
 * hub pages. Asserting by visible section headings instead of selectors
 * so a future refactor that keeps the section but renames its class
 * doesn't silently regress.
 */
test.describe('Phase-8 — homepage trim', () => {
  test('homepage no longer renders the four removed sections', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });

    // Headings that USED to be on the homepage and now live elsewhere.
    // (Each one corresponds to a removed `<Process/>`, `<Education/>`,
    // `<TurkeyResidence/>`, or `<Testimonials/>` component.)
    const removedHeadings = [
      'مراحل کار با ما',           // Process
      'مسیر تحصیل در آلمان',        // Education
      'اقامت تحصیلی ترکیه',         // TurkeyResidence (homepage version)
      'نظر دانشجویان',              // Testimonials
    ];
    for (const heading of removedHeadings) {
      // Use exact-match strict assertion — the standalone hub pages may
      // legitimately use these strings.
      const locator = page.getByRole('heading', { name: heading, exact: true });
      await expect(locator).toHaveCount(0);
    }
  });

  test('homepage still renders the kept sections', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('آلمانیار، همراه هوشمند مسیر مهاجرت شما')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'چرا آلمانیار؟' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'پنل مشترک شما و مشاورتان' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'خدمات ما' })).toBeVisible();
  });
});
