import { expect, test } from '@playwright/test';

// Five pages of different types — all live under /fa, so all should share the
// exact same header/footer rendered by [locale]/layout.tsx.
const PAGES = [
  '/fa',
  '/fa/guide',
  '/fa/evaluation',
  '/fa/germany-visa',
  '/fa/germany-visa/visametric',
];

async function extractInnerHTML(page: import('@playwright/test').Page, selector: string) {
  return page.locator(selector).first().innerHTML();
}

test.describe('BUG-05 — Header / Footer single source', () => {
  test('<header> is byte-identical across pages', async ({ page }) => {
    const headers: string[] = [];
    for (const p of PAGES) {
      await page.goto(p, { waitUntil: 'domcontentloaded' });
      headers.push(await extractInnerHTML(page, 'header'));
    }
    // Every entry should equal the first one.
    for (let i = 1; i < headers.length; i++) {
      expect(headers[i], `${PAGES[i]} header differs from ${PAGES[0]}`).toBe(headers[0]);
    }
  });

  test('<footer> is byte-identical across pages', async ({ page }) => {
    const footers: string[] = [];
    for (const p of PAGES) {
      await page.goto(p, { waitUntil: 'domcontentloaded' });
      footers.push(await extractInnerHTML(page, 'footer'));
    }
    for (let i = 1; i < footers.length; i++) {
      expect(footers[i], `${PAGES[i]} footer differs from ${PAGES[0]}`).toBe(footers[0]);
    }
  });
});
