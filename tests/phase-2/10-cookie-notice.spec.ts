import { test, expect } from '@playwright/test';

const STORAGE_KEY = 'almanyar_cookie_notice_dismissed_v1';

test.describe('LEGAL-03 — cookie notice', () => {
  // Each test starts with empty storage; we clear AFTER the first navigation
  // so subsequent reloads/visits keep whatever the test code persists.
  async function clearOnce(page: import('@playwright/test').Page) {
    await page.evaluate((k) => window.localStorage.removeItem(k as string), STORAGE_KEY);
    await page.reload({ waitUntil: 'domcontentloaded' });
  }

  test('appears on first visit', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    await clearOnce(page);
    const notice = page.getByTestId('cookie-notice');
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('این سایت از کوکی‌ها');
    await expect(notice.locator('a[href$="/fa/privacy"]')).toHaveCount(1);
  });

  test('"متوجه شدم" click hides the notice and persists across reload', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    await clearOnce(page);

    const notice = page.getByTestId('cookie-notice');
    await expect(notice).toBeVisible();

    await notice.getByRole('button', { name: 'متوجه شدم' }).click();
    await expect(notice).toBeHidden();

    // The persisted shape after click.
    const stored = await page.evaluate((k) => window.localStorage.getItem(k as string), STORAGE_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.v).toBe(1);
    expect(typeof parsed.dismissedAt).toBe('number');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('cookie-notice')).toHaveCount(0);
  });

  test('closing without clicking → notice reappears next visit', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    await clearOnce(page);
    await expect(page.getByTestId('cookie-notice')).toBeVisible();

    // Navigate away without clicking — storage stays empty.
    await page.goto('about:blank');

    // Come back to /fa. With no localStorage entry from the prior visit,
    // the notice must reappear.
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('cookie-notice')).toBeVisible();
  });
});
