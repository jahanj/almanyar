import { test, expect } from '@playwright/test';

/**
 * TRUST-09 — Germany honesty callout in /fa/how-it-works step 4.
 *
 * Phase-2 LEGAL-01 put the long version on /fa/disclaimer. Phase-2
 * POSITIONING-01 wrote step 4 ("مسیر آلمان") of /fa/how-it-works. This
 * adds a short, in-context callout under step 4 so any reader who only
 * skims that page still sees the explicit "no German outcome guarantee"
 * statement.
 */
test.describe('TRUST-09 — Germany honesty callout', () => {
  test('callout under step 4 contains the no-guarantee sentence', async ({ page }) => {
    await page.goto('/fa/how-it-works', { waitUntil: 'domcontentloaded' });

    const callout = page.getByTestId('step-callout').last();
    await expect(callout).toBeVisible();
    await expect(callout).toContainText('درباره تجربه ما در مسیر آلمان');
    await expect(callout).toContainText('ما در ترکیه ۶ سال تجربه عملی داریم');
    await expect(callout).toContainText('چیزی نیست که هیچ مشاوری بتواند تضمین کند');
  });
});
