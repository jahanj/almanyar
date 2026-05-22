import { expect, test } from '@playwright/test';

test.describe('BUG-06 — eval form Country picker + persistence + honeypot', () => {
  // Set country via the native select; wait for React hydration to finish first
  // (otherwise selectOption fires before the onChange handler is attached and
  // the conditional province picker never renders).
  async function selectCountry(page: import('@playwright/test').Page, value: 'IR' | 'TR' | 'OTHER') {
    const select = page.getByTestId('eval-country');
    await select.waitFor();
    // Hydration heuristic: try to interact and verify React picked it up by
    // checking if a conditional render appears. Retry up to 10 times.
    for (let i = 0; i < 10; i++) {
      await select.selectOption(value);
      const probe = value === 'OTHER' ? 'eval-province-other'
        : value === 'TR' ? 'eval-province-tr' : 'eval-province-ir';
      if (await page.getByTestId(probe).count() > 0) return;
      await page.waitForTimeout(150);
    }
    throw new Error(`country=${value} change never triggered conditional render`);
  }

  test('selecting ترکیه swaps province dropdown to Turkish list', async ({ page }) => {
    await page.goto('/fa/evaluation', { waitUntil: 'domcontentloaded' });
    await selectCountry(page, 'TR');
    await expect(page.getByTestId('eval-province-tr')).toBeVisible();
    await expect(page.locator('[data-testid="eval-province-tr"] option:has-text("İstanbul")')).toHaveCount(1);
    await expect(page.getByTestId('eval-province-ir')).toHaveCount(0);
  });

  test('selecting ایران shows Iranian provinces, not Turkish', async ({ page }) => {
    await page.goto('/fa/evaluation', { waitUntil: 'domcontentloaded' });
    await selectCountry(page, 'IR');
    await expect(page.getByTestId('eval-province-ir')).toBeVisible();
    await expect(page.locator('[data-testid="eval-province-ir"] option:has-text("تهران")')).toHaveCount(1);
    await expect(page.getByTestId('eval-province-tr')).toHaveCount(0);
  });

  test('selecting سایر reveals a free-text city/country input', async ({ page }) => {
    await page.goto('/fa/evaluation', { waitUntil: 'domcontentloaded' });
    await selectCountry(page, 'OTHER');
    await expect(page.getByTestId('eval-province-other')).toBeVisible();
  });

  test('localStorage persists the form across reloads', async ({ page }) => {
    await page.goto('/fa/evaluation', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('eval-fullname').fill('Test Persianov');
    await page.waitForTimeout(400); // past the 250ms debounce
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('eval-fullname')).toHaveValue('Test Persianov');
    // Clean up so this draft doesn't leak into other tests.
    await page.evaluate(() => window.localStorage.removeItem('almanyar_eval_v1'));
  });

  test('honeypot is in the DOM but visually hidden (sr-only)', async ({ page }) => {
    await page.goto('/fa/evaluation', { waitUntil: 'domcontentloaded' });
    const hp = page.locator('input[name="hp"]');
    await expect(hp).toHaveCount(1);
    const cls = await hp.locator('xpath=..').getAttribute('class');
    expect(cls).toContain('sr-only');
  });
});
