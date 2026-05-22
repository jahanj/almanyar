import { test, expect } from '@playwright/test';

/**
 * SEO-04 — sitemap.xml structure
 *
 * Validates that:
 *  - Every PUBLIC_ROUTES entry is present, locale-prefixed
 *  - Each <url> carries an <xhtml:link rel="alternate" hreflang="fa">
 *  - No /admin /login /dashboard /api leak in
 *  - <lastmod> dates are valid ISO YYYY-MM-DD
 */

const EXPECTED_PRESENT = [
  '/fa',
  '/fa/guide',
  '/fa/exams',
  '/fa/germany-visa-from-turkey',
  '/fa/turkey-residence',
  '/fa/turkey-costs',
  '/fa/evaluation',
  '/fa/germany-visa/visametric',
  '/fa/study-germany/student-visa',
];

const FORBIDDEN_PREFIXES = ['/admin', '/login', '/register', '/dashboard', '/api/', '/forgot-password'];

test.describe('SEO-04 — sitemap.xml', () => {
  test('lists every expected /fa/* path and no auth/admin/api leaks', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();

    const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => new URL(m[1]).pathname);

    for (const p of EXPECTED_PRESENT) {
      expect(locs, `${p} missing from sitemap`).toContain(p);
    }
    for (const bad of FORBIDDEN_PREFIXES) {
      const leak = locs.find((p) => p.startsWith(bad));
      expect(leak, `auth/admin/api path leaked: ${leak}`).toBeUndefined();
    }
  });

  test('every <url> carries <xhtml:link rel="alternate" hreflang="fa">', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();

    // Split into <url>...</url> blocks (cheap, no XML parser).
    const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
    expect(blocks.length, 'sitemap has zero <url> entries').toBeGreaterThan(5);

    for (const block of blocks) {
      const hasFa = /xhtml:link[^>]*hreflang="fa"[^>]*href="[^"]+"/.test(block);
      const hasXDefault = /xhtml:link[^>]*hreflang="x-default"[^>]*href="[^"]+"/.test(block);
      // We require at minimum fa + x-default once tr/en are populated;
      // today both are the same fa URL but both should be emitted.
      expect(hasFa, `block missing hreflang="fa":\n${block}`).toBe(true);
      expect(hasXDefault, `block missing hreflang="x-default":\n${block}`).toBe(true);
    }
  });

  test('every <lastmod> is a valid ISO date', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const lastmods = Array.from(xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)).map((m) => m[1]);
    expect(lastmods.length).toBeGreaterThan(0);
    for (const lm of lastmods) {
      expect(lm, `not a valid ISO date: ${lm}`).toMatch(/^\d{4}-\d{2}-\d{2}/);
      const d = new Date(lm);
      expect(Number.isNaN(d.getTime()), `unparseable date: ${lm}`).toBe(false);
    }
  });
});
