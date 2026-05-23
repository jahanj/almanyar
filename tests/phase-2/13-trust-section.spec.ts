import { test, expect } from '@playwright/test';

/**
 * Homepage trust section. Phase-2 POSITIONING-02 introduced this block;
 * Phase-3 TRUST-06 rewrote it as three cards (see tests/phase-3/06-trust-cards.spec.ts
 * for the assertion on the new shape).
 *
 * This file only pins the high-level invariant that the section exists +
 * carries a CTA to /fa/about (Phase-3) or /fa/how-it-works.
 */
test.describe('Homepage trust section — exists with onward CTA', () => {
  test('section renders + has a link to /fa/about or /fa/how-it-works', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    const section = page.getByTestId('trust-model');
    await expect(section).toBeVisible();
    const onward = section.locator('a[href$="/fa/about"], a[href$="/fa/how-it-works"]');
    expect(await onward.count(), 'trust section must link to /about or /how-it-works').toBeGreaterThan(0);
  });
});
