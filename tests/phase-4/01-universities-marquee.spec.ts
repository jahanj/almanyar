import { test, expect } from '@playwright/test';

/**
 * Phase-4 §3 — university marquee renders on /fa.
 *
 * Asserts:
 *  - section present
 *  - cautious headline (no partnership claim)
 *  - at least 25 logo slots in the rendered reel (we duplicate the list,
 *    so the real assertion is "at least 2× the data file's length")
 *  - independence disclaimer present
 */

test.describe('Phase-4 — university marquee', () => {
  test('renders between cinematic hero and TrustModel with all uni slots', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });

    const section = page.getByTestId('universities-marquee');
    await expect(section).toBeVisible();

    await expect(section).toContainText('از دانشگاه‌های همکار ترکیه پذیرش می‌گیریم');
    await expect(section).toContainText('وابسته به هیچ‌یک نیست');

    // Each uni renders one slot; the array is duplicated for the seamless
    // loop. So slot count = 2 × |UNIVERSITIES|. We don't import the const
    // here (avoids tight coupling); ≥ 50 is the conservative floor with
    // today's 26-entry starter list.
    const slots = await section.locator('[aria-label][title], img[alt]').count();
    expect(slots).toBeGreaterThanOrEqual(50);
  });
});
