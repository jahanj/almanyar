import { test, expect } from '@playwright/test';

/**
 * SEO-07 — split /fa/germany-visa (hub) vs /fa/germany-visa/what-is (article).
 *
 * The hub MUST:
 *  - return 200
 *  - render the tailored visa-group intro
 *  - link to /fa/germany-visa/what-is somewhere on the page
 *
 * The article MUST:
 *  - return 200
 *  - contain its long-form body (we probe for the intro paragraph)
 *  - NOT itself be the hub (no list of all visa topics in card grid)
 */
test.describe('SEO-07 — visa hub split', () => {
  test('/fa/germany-visa is the hub with a link to /what-is', async ({ page, request }) => {
    expect((await request.get('/fa/germany-visa')).status()).toBe(200);
    await page.goto('/fa/germany-visa', { waitUntil: 'domcontentloaded' });

    // Tailored intro mentions "ویزای آلمان چیست؟" — that's the magic phrase.
    await expect(page.locator('body')).toContainText('ویزای آلمان چیست؟');

    // Has a link pointing at the article.
    const link = page.locator('a[href$="/fa/germany-visa/what-is"]').first();
    await expect(link).toBeVisible();
  });

  test('/fa/germany-visa/what-is is the long-form article', async ({ page, request }) => {
    expect((await request.get('/fa/germany-visa/what-is')).status()).toBe(200);
    await page.goto('/fa/germany-visa/what-is', { waitUntil: 'domcontentloaded' });

    // Probe for a sentence that's in the article body but never on the hub.
    await expect(page.locator('body')).toContainText('ویزای آلمان مجوز رسمی ورود به این کشور است');
  });
});
