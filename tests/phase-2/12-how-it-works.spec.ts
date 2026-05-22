import { test, expect } from '@playwright/test';

/**
 * POSITIONING-01 — /fa/how-it-works
 *
 * The trust page is the anchor for honest service positioning. Verifies:
 *  - returns 200
 *  - renders all four steps + the "چرا این مدل به نفع شماست" block
 *  - includes the explicit "tuition never flows through us" sentence
 *  - has the "نحوه کار ما" entry in the primary nav
 *  - has a final CTA linking back to homepage #contact
 */

test.describe('POSITIONING-01 — /fa/how-it-works', () => {
  test('page exists with all four steps + trust block + CTA', async ({ page, request }) => {
    expect((await request.get('/fa/how-it-works')).status()).toBe(200);
    await page.goto('/fa/how-it-works', { waitUntil: 'domcontentloaded' });

    // Four-step model headings.
    for (const phrase of [
      'پذیرش دانشگاه ترکیه',
      'تصمیم با شماست',
      'خدمات استقرار در ترکیه',
      'همراهی در مسیر آلمان',
    ]) {
      await expect(page.locator('body')).toContainText(phrase);
    }

    // The single most important honesty sentence.
    await expect(page.locator('body')).toContainText('شهریه هرگز از طریق ما عبور نمی‌کند');

    // Why-block heading.
    await expect(page.locator('body')).toContainText('چرا این مدل به نفع شماست');

    // Final CTA → /fa#contact.
    const cta = page.locator('a[href$="/fa#contact"]').last();
    await expect(cta).toBeVisible();
  });

  test('"نحوه کار ما" appears in the site header nav', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    const navLink = page.locator('header a[href$="/fa/how-it-works"]');
    await expect(navLink).toHaveCount(1);
  });
});
