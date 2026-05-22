import { expect, test } from '@playwright/test';

/**
 * Empty-DB (or never-filled) state: the homepage hero stats block, the rating
 * button and the testimonials section all hide rather than render literal
 * zeros — which is exactly what BUG-03 said the live site was doing.
 */
test.describe('BUG-03 — empty stats hide cleanly', () => {
  test('hero stats grid + rating button are absent when SiteStats is unset', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });

    // Stats grid lives on a div with class cj-brand-stats. Hidden when empty.
    const statsGrid = page.locator('.cj-brand-stats');
    expect(await statsGrid.count(), 'cj-brand-stats should be absent on empty DB').toBe(0);

    // Rating button lives on a button with class cj-brand-rating. Hidden when
    // there are zero approved reviews and no manual reviewsCount.
    const ratingBtn = page.locator('.cj-brand-rating');
    expect(await ratingBtn.count(), 'cj-brand-rating should be absent on empty DB').toBe(0);
  });

  test('Testimonials section is absent when reviews < 5', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    // The Testimonials section heading uses 'نظرات' from dict.nav. Search the
    // page for the static "هنوز نظری ثبت نشده" placeholder copy from the old
    // implementation — it must NOT appear.
    const empty = page.getByText('هنوز نظری ثبت نشده', { exact: false });
    expect(await empty.count(), 'empty-state placeholder must not be rendered').toBe(0);
  });

  test('no literal "۰" sits in the hero stat cells', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    // Quick guard: there should be no element whose only text is the Persian
    // zero glyph in the hero area.
    const zeros = await page.locator('.cj-brand-stats >> text=/^۰[+٪]?$/').count();
    expect(zeros).toBe(0);
  });
});
