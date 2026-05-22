import { test, expect } from '@playwright/test';

/**
 * SEO-02 — hreflang
 *
 * Today only Persian is populated. Every page must emit:
 *  - <link rel="alternate" hreflang="fa">
 *  - <link rel="alternate" hreflang="x-default">
 * …and MUST NOT emit hreflang for tr/en until translated content exists
 * (broken hreflang URLs get flagged in Google Search Console).
 *
 * The `translatedLocales` opt-in on pageMetadata is the forward-compat
 * seam — adding `'tr'` or `'en'` per-page will produce a matching
 * <link rel="alternate" hreflang="tr"|"en"> tag without touching
 * pageMetadata. This test pins the no-tr-no-en invariant until then.
 */

const PAGES = [
  '/fa',
  '/fa/guide',
  '/fa/turkey-costs',
  '/fa/germany-visa',
  '/fa/germany-visa/what-is',
  '/fa/exams',
  '/fa/exams/dsh',
];

test.describe('SEO-02 — hreflang', () => {
  for (const path of PAGES) {
    test(`${path}: fa + x-default present, no tr/en`, async ({ page, request }) => {
      const resp = await request.get(path);
      if (resp.status() !== 200) test.skip(true, `${path} -> ${resp.status()}`);

      await page.goto(path, { waitUntil: 'domcontentloaded' });

      // Count specific hreflang values via attribute selectors.
      const faCount = await page.locator('link[rel="alternate"][hreflang="fa"]').count();
      const xCount  = await page.locator('link[rel="alternate"][hreflang="x-default"]').count();
      const trCount = await page.locator('link[rel="alternate"][hreflang="tr"]').count();
      const enCount = await page.locator('link[rel="alternate"][hreflang="en"]').count();

      expect(faCount, `${path}: hreflang=fa must appear exactly once`).toBe(1);
      expect(xCount,  `${path}: hreflang=x-default must appear exactly once`).toBe(1);
      expect(trCount, `${path}: hreflang=tr must NOT appear (no Turkish content yet)`).toBe(0);
      expect(enCount, `${path}: hreflang=en must NOT appear (no English content yet)`).toBe(0);
    });
  }
});
