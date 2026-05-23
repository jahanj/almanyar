import { test, expect } from '@playwright/test';

/**
 * TRUST-03 — footer contact column.
 *
 * Asserts:
 *  - "تماس" column heading is present
 *  - mailto link points at contact@almanyar.com
 *  - WhatsApp link uses wa.me/<E.164> with a prefilled message
 *  - city is "استانبول، ترکیه"
 *  - NO social media icons (Instagram / Telegram / LinkedIn / Twitter / X)
 *
 * Plus the Phase-1 byte-identical-across-pages guarantee still holds —
 * tested separately by tests/phase-1/05-layout.spec.ts.
 */

const SOCIAL_PATTERNS = [
  'instagram.com',
  't.me/',
  'telegram.',
  'linkedin.com',
  'twitter.com',
  'x.com/',
  'facebook.com',
];

test.describe('TRUST-03 — footer contact column', () => {
  test('email + WhatsApp + city visible, no social icons', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    const contact = page.getByTestId('footer-contact');
    await expect(contact).toBeVisible();
    await expect(contact).toContainText('تماس');

    // Email
    const email = contact.locator('a[href="mailto:contact@almanyar.com"]');
    await expect(email).toHaveCount(1);
    await expect(email).toContainText('contact@almanyar.com');

    // WhatsApp — must be wa.me + the E.164 number + prefilled text param
    const wa = contact.locator('a[href*="wa.me/905067708295"]');
    await expect(wa).toHaveCount(1);
    const waHref = await wa.getAttribute('href');
    expect(waHref).toContain('text=');

    // City
    await expect(contact).toContainText('استانبول، ترکیه');

    // No social links anywhere in the footer
    const footer = page.locator('footer');
    for (const pattern of SOCIAL_PATTERNS) {
      const hits = await footer.locator(`a[href*="${pattern}"]`).count();
      expect(hits, `social-media link (${pattern}) leaked into footer`).toBe(0);
    }
  });
});
