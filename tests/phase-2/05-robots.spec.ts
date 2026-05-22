import { test, expect } from '@playwright/test';

/**
 * SEO-05 — robots.txt
 *
 * The Playwright dev server runs with NEXT_PUBLIC_ENV unset (the spec gate
 * is `=== 'production'`, so unset is treated as non-production = staging /
 * preview). We assert the safe-by-default Disallow-everything shape here.
 *
 * Production behaviour (the verbose multi-UA Allow + sitemap line) is
 * verified at deploy time by curl'ing https://almanyar.com/robots.txt
 * and visually inspecting — captured in PHASE-2-REPORT.md.
 */

test.describe('SEO-05 — robots.txt', () => {
  test('non-production env returns full-site Disallow + sitemap line absent', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();

    // Safe-default mode: a single rule blocking everything.
    expect(body).toContain('User-Agent: *');
    expect(body).toMatch(/Disallow:\s*\/\s*$/m);
    expect(body, 'staging robots must not advertise sitemap.xml').not.toContain('Sitemap:');
  });
});
