import { test, expect } from '@playwright/test';

/**
 * Phase-4 §5 — marketing opt-in at registration.
 *
 * Asserts:
 *  - /register renders the new checkbox, UNCHECKED by default (GDPR).
 *  - /api/marketing/unsubscribe responds (302 to /fa/unsubscribed) even
 *    with no/invalid token — silent friendly fallback per the spec.
 *  - /fa/unsubscribed page renders with the confirmation copy.
 *
 * The full opt-in → welcome-email → unsubscribe loop requires a live
 * DB + SMTP and is covered by the manual checklist in PHASE-4-REPORT.md.
 */

test.describe('Phase-4 §5 — marketing opt-in', () => {
  test('register form shows marketing checkbox, unchecked by default', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    const wrap = page.getByTestId('register-marketing-wrap');
    await expect(wrap).toBeVisible();
    await expect(wrap).toContainText('راهنماها و اطلاعات مفید');
    const cb = page.getByTestId('register-marketing');
    await expect(cb).not.toBeChecked();
  });

  test('unsubscribe endpoint without token still redirects to /fa/unsubscribed', async ({ request }) => {
    const res = await request.get('/api/marketing/unsubscribe', { maxRedirects: 0 });
    expect([302, 307, 308]).toContain(res.status());
    const loc = res.headers().location ?? '';
    expect(loc).toContain('/fa/unsubscribed');
  });

  test('/fa/unsubscribed renders Persian confirmation page', async ({ page }) => {
    await page.goto('/fa/unsubscribed', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('عضویت لغو شد');
    await expect(page.locator('body')).toContainText('بازگشت به صفحه اصلی');
  });
});
