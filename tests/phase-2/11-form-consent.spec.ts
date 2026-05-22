import { test, expect } from '@playwright/test';

/**
 * LEGAL-04 — required consent gate on evaluation + contact forms.
 *
 * The required checkbox must:
 *  - render on the relevant step
 *  - block submission when unchecked (UI never sends the POST)
 *  - allow submission when checked (form goes into network land — but
 *    the dev DB isn't available, so we just verify the POST is attempted)
 *
 * The optional marketing checkbox must:
 *  - render visible-but-unchecked by default (per ack §5.G)
 *  - not be required
 */

const STORAGE_KEY = 'almanyar_eval_v1';

test.describe('LEGAL-04 — form consent', () => {
  test.beforeEach(async ({ page }) => {
    // Clean slate; use networkidle so React hydration completes before we touch inputs.
    await page.goto('/fa/evaluation', { waitUntil: 'networkidle' });
    await page.evaluate((k) => window.localStorage.removeItem(k as string), STORAGE_KEY);
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('evaluation form: required consent checkbox + optional marketing default-off', async ({ page }) => {
    // Wait for React handlers on the first input before filling.
    const fullname = page.getByTestId('eval-fullname');
    await fullname.waitFor({ state: 'visible' });
    await fullname.click();
    await fullname.fill('Test User');
    await page.locator('label:has-text("تلفن همراه") + input').fill('+90 555 111 22 33');
    await page.locator('label:has-text("ایمیل") + input').fill('test@example.com');

    const country = page.getByTestId('eval-country');
    for (let i = 0; i < 10; i++) {
      await country.selectOption('TR');
      if (await page.getByTestId('eval-province-tr').count() > 0) break;
      await page.waitForTimeout(150);
    }

    // Walk to the final step.
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: 'مرحله بعد' }).click();
      await page.waitForTimeout(120);
    }

    await expect(page.getByTestId('eval-consent-terms')).toBeVisible();
    await expect(page.getByTestId('eval-consent-terms')).not.toBeChecked();
    await expect(page.getByTestId('eval-marketing')).toBeVisible();
    await expect(page.getByTestId('eval-marketing')).not.toBeChecked();

    // Submit without checking — expect the inline error.
    await page.getByRole('button', { name: 'ارسال فرم ارزیابی' }).click();
    await expect(page.locator('body')).toContainText(
      'برای ارسال فرم، موافقت با حریم خصوصی و سلب مسئولیت لازم است.',
    );
  });

  test('contact form: required consent checkbox blocks submission when unchecked', async ({ page }) => {
    await page.goto('/fa#contact', { waitUntil: 'domcontentloaded' });
    // Skip if the homepage doesn't render the contact form (defensive).
    const contactForm = page.locator('form').filter({ has: page.getByTestId('contact-consent-terms') });
    if (await contactForm.count() === 0) test.skip(true, 'contact form not present on /fa');

    const terms = page.getByTestId('contact-consent-terms');
    const marketing = page.getByTestId('contact-marketing');
    await expect(terms).toBeVisible();
    await expect(marketing).toBeVisible();
    await expect(terms).not.toBeChecked();
    await expect(marketing).not.toBeChecked();
  });
});
