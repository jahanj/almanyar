import { expect, test } from '@playwright/test';

// Every locale-prefixed page that should ship clean meta.
const PAGES = [
  '/fa',
  '/fa/guide',
  '/fa/evaluation',
  '/fa/turkey-costs',
  '/fa/turkey-residence',
  '/fa/exams',
  '/fa/germany-visa',
  '/fa/germany-visa/visametric',
  '/fa/germany-visa-from-turkey',
  '/fa/study-germany',
  '/fa/work-germany',
  '/fa/jobs-germany',
  '/fa/life-germany',
];

function endsMidWord(text: string): boolean {
  const last = text.trim().slice(-1);
  return /[؀-ۿA-Za-z0-9]/.test(last);
}

test.describe('BUG-07 — meta descriptions & keywords', () => {
  for (const path of PAGES) {
    test(`${path} has clean meta`, async ({ page, request }) => {
      const resp = await request.get(path);
      if (resp.status() !== 200) test.skip(true, `${path} -> ${resp.status()}`);

      await page.goto(path, { waitUntil: 'domcontentloaded' });

      const description = await page
        .locator('meta[name="description"]')
        .first()
        .getAttribute('content');

      expect(description, `${path}: <meta name="description"> missing`).not.toBeNull();
      const desc = (description ?? '').trim();
      expect(desc.length, `${path}: description empty`).toBeGreaterThan(0);
      expect(desc.length, `${path}: description ${desc.length} > 160 (${desc})`).toBeLessThanOrEqual(160);
      expect(endsMidWord(desc), `${path}: description ends mid-word — "…${desc.slice(-24)}"`).toBe(false);

      const keywordsCount = await page.locator('meta[name="keywords"]').count();
      expect(keywordsCount, `${path}: <meta name="keywords"> must not exist`).toBe(0);
    });
  }
});
