import { test, expect } from '@playwright/test';

/**
 * TRUST-07 — homepage hero sharpens to embassy-driven positioning.
 *
 * The cinematic hero's Iran-scene caption is the visible H1 on /fa.
 * Spec asks for sharper SEO+positioning copy without dismantling the
 * Phase-1 cinematic structure (see PHASE-3-PLAN §5.B ack).
 *
 * Asserts:
 *  - new H1 "مهاجرت تحصیلی به آلمان از ترکیه" renders
 *  - subtitle name-checks the Tehran embassy
 *  - the old lyrical caption is no longer present anywhere
 */
test.describe('TRUST-07 — hero embassy-driven copy', () => {
  test('Iran-scene caption shows the new H1 + subtitle', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText('مهاجرت تحصیلی به آلمان از ترکیه');
    await expect(page.locator('body')).toContainText('سفارت آلمان در تهران غیرقابل پیش‌بینی است');

    const oldH1Count = await page.locator(':text("هر مسیر بزرگی، از یک تصمیم شروع می‌شود")').count();
    expect(oldH1Count, 'old lyrical Iran-scene caption must be gone').toBe(0);
  });
});
