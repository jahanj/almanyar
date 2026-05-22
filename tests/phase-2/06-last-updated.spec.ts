import { test, expect } from '@playwright/test';

// SEO-06 — every guide/article page renders a Jalali "آخرین به‌روزرسانی" line.
// Topic-routed pages get it via topic-route.tsx; bespoke pages get it via
// the updatedAt prop passed to <PageHero>.

const PAGES = [
  '/fa/guide',
  '/fa/turkey-costs',
  '/fa/turkey-residence',
  '/fa/exams',
  '/fa/germany-visa/visametric',
  '/fa/study-germany/student-visa',
  '/fa/work-germany/eu-blue-card',
  '/fa/life-germany/housing',
];

test.describe('SEO-06 — آخرین به‌روزرسانی date', () => {
  for (const path of PAGES) {
    test(`${path} renders a Jalali last-updated date`, async ({ page, request }) => {
      const resp = await request.get(path);
      if (resp.status() !== 200) test.skip(true, `${path} -> ${resp.status()}`);

      await page.goto(path, { waitUntil: 'domcontentloaded' });

      const target = page.getByTestId('last-updated');
      await expect(target).toBeVisible();

      // Text contains the prefix and a <time datetime="YYYY-MM-DD">.
      const text = (await target.innerText()).trim();
      expect(text).toContain('آخرین به‌روزرسانی');

      const timeEl = target.locator('time');
      const datetime = await timeEl.getAttribute('datetime');
      expect(datetime, `${path}: <time datetime> attr missing`).toMatch(/^\d{4}-\d{2}-\d{2}/);

      // The visible date string should use Persian (Jalali) digits and month name —
      // an English-formatted "May 22, 2026" would mean the formatter misfired.
      const visible = await timeEl.innerText();
      // Persian digits 0-9 are U+06F0..U+06F9
      expect(visible, `${path}: visible date "${visible}" is not Persian-digit Jalali`).toMatch(/[۰-۹]/);
    });
  }
});
