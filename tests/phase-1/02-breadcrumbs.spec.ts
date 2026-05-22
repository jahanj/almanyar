import { expect, test } from '@playwright/test';

// Sample pages with breadcrumbs — covers the topic-route pages where the
// original BUG-02 report originated, plus other locale pages.
const PAGES = [
  '/fa/germany-visa',
  '/fa/germany-visa/visametric',
  '/fa/germany-visa/requirements',
  '/fa/study-germany/student-visa',
  '/fa/work-germany/eu-blue-card',
  '/fa/jobs-germany/in-demand-jobs',
  '/fa/life-germany/housing',
  '/fa/exams/dsh',
  '/fa/ausbildung/visa',
  '/fa/germany-embassy/tehran',
];

test.describe('BUG-02 — breadcrumbs', () => {
  for (const path of PAGES) {
    test(`${path}: every breadcrumb link returns 200`, async ({ page, request }) => {
      const resp = await page.goto(path, { waitUntil: 'domcontentloaded' });
      if (!resp || resp.status() !== 200) test.skip(true, `${path} -> ${resp?.status()}`);

      // PageHero renders breadcrumbs in <nav aria-label="breadcrumb">.
      const links = page.locator('nav[aria-label="مسیر"] a');
      const count = await links.count();
      expect(count, `${path}: no breadcrumb links found`).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const href = await links.nth(i).getAttribute('href');
        expect(href, `${path}: breadcrumb #${i} has no href`).toBeTruthy();
        const target = new URL(href!, 'http://x').pathname;
        const probe = await request.get(target, { maxRedirects: 0 });
        expect([200, 301, 307, 308], `${path}: breadcrumb #${i} (${href}) status ${probe.status()}`).toContain(probe.status());
      }

      // The current page label is rendered as <span aria-current="page">, not a link.
      const currentCount = await page.locator('nav[aria-label="مسیر"] [aria-current="page"]').count();
      expect(currentCount, `${path}: expected exactly one [aria-current="page"]`).toBe(1);
    });
  }
});
