import { test, expect } from '@playwright/test';

/**
 * Phase-5 TASK-05 — the focused case sub-route must require auth.
 *
 * Unauthenticated visitors should be bounced to /login with the
 * original URL as callbackUrl so they land back on the right case
 * after signing in.
 */
test.describe('Phase-5 — /dashboard/cases/[id] auth', () => {
  test('redirects unauthenticated visitor to /login with callbackUrl', async ({ page }) => {
    const res = await page.goto('/dashboard/cases/sampleid', {
      waitUntil: 'domcontentloaded',
    });
    expect(res?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/login(\?|$)/);
    expect(page.url()).toContain('callbackUrl=');
    expect(decodeURIComponent(page.url())).toContain('/dashboard/cases/sampleid');
  });
});
