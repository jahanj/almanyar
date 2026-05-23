import { test, expect } from '@playwright/test';

/**
 * TRUST-08 — floating WhatsApp button.
 *
 * Asserts:
 *  - visible on /fa, /fa/about, /fa/guide
 *  - href is wa.me with prefilled message + correct aria-label
 *  - absent on /admin (mounted inside [locale]/layout, so /admin
 *    never sees it; this is the belt-and-suspenders check)
 */

const PRESENT_ON = ['/fa', '/fa/about', '/fa/guide', '/fa/how-it-works'];
const ABSENT_ON = ['/admin', '/login'];

test.describe('TRUST-08 — floating WhatsApp button', () => {
  for (const path of PRESENT_ON) {
    test(`visible on ${path}`, async ({ page, request }) => {
      if ((await request.get(path)).status() !== 200) test.skip(true, `${path} not reachable`);
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const btn = page.getByTestId('floating-whatsapp');
      await expect(btn).toBeVisible();
      const href = await btn.getAttribute('href');
      expect(href).toContain('wa.me/905067708295');
      expect(href).toContain('text=');
      await expect(btn).toHaveAttribute('aria-label', 'گفت‌وگو در واتساپ');
    });
  }

  for (const path of ABSENT_ON) {
    test(`absent on ${path}`, async ({ page, request }) => {
      const r = await request.get(path);
      // login may 200, admin may 302/307; if reachable, the button must NOT render.
      if (r.status() >= 500) test.skip(true, `${path} -> ${r.status()}`);
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const btn = page.getByTestId('floating-whatsapp');
      expect(await btn.count(), `floating WhatsApp leaked into ${path}`).toBe(0);
    });
  }
});
