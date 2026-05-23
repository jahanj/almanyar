import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

/**
 * TRUST-05 — real-stats seed migration shape.
 *
 * Verifies the new migration file is correctly shaped:
 *  - targets the singleton SiteStats row (id = 1)
 *  - sets studentsCount = 20 and yearsExperience = 6
 *  - is idempotent (uses COALESCE so re-running doesn't clobber owner edits)
 *  - does NOT touch partner_universities / success / rating / reviews
 *
 * The behavioral assertion ("homepage shows 20+ + 6 سال") happens on the
 * deployed site where Postgres is reachable — captured in the manual
 * verification checklist in PHASE-3-REPORT.md. The dev-server Playwright
 * environment runs without a DB, so loadSiteStats returns EMPTY and the
 * stats grid stays hidden (Phase-1 BUG-03 behaviour, unchanged).
 */
test.describe('TRUST-05 — stats seed migration', () => {
  test('migration is idempotent and targets only the visible-stats columns', () => {
    const sql = readFileSync('prisma/migrations/20260523_seed_real_stats/migration.sql', 'utf8');

    expect(sql).toMatch(/UPDATE\s+"SiteStats"/i);
    expect(sql).toMatch(/WHERE\s+"id"\s*=\s*1/i);
    expect(sql).toMatch(/COALESCE\("studentsCount",\s*20\)/);
    expect(sql).toMatch(/COALESCE\("yearsExperience",\s*6\)/);

    // Must NOT pre-populate columns that need defensible numbers later.
    expect(sql).not.toMatch(/partnerUniversities/);
    expect(sql).not.toMatch(/successRate/);
    expect(sql).not.toMatch(/averageRating/);
    expect(sql).not.toMatch(/reviewsCount/);
  });

  test('homepage continues to hide all stats when DB is empty (Phase-1 hide rule unchanged)', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    const statsGrid = page.locator('.cj-brand-stats');
    expect(await statsGrid.count(), 'with no DB connection, no stats render').toBe(0);
  });
});
