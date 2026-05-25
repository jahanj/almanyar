import { test, expect } from '@playwright/test';

/**
 * Phase-8D — /fa/news feed renders + category chips visible.
 *
 * Doesn't require any seeded posts: the page should 200 even with an
 * empty DB (shows "هنوز خبری منتشر نشده" copy). Category chips come
 * from the 6 seeded PostCategory rows, so we can assert their slugs.
 */
test.describe('Phase-8 — public /fa/news', () => {
  test('feed page responds 200 and shows category chips', async ({ page }) => {
    const res = await page.goto('/fa/news', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);

    await expect(page.getByRole('heading', { name: 'اخبار و به‌روزرسانی‌ها' })).toBeVisible();

    // Each seeded category surfaces as a chip linking to /fa/news/category/<slug>.
    for (const slug of ['exams', 'germany-visa', 'study-germany', 'work-germany', 'life-germany', 'news-updates']) {
      await expect(page.locator(`a[href$="/fa/news/category/${slug}"]`)).toBeVisible();
    }
  });

  test('category page responds 200', async ({ page }) => {
    const res = await page.goto('/fa/news/category/germany-visa', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'ویزای آلمان' })).toBeVisible();
  });
});
