import { test, expect } from '@playwright/test';

/**
 * SEO-01 — verify zero <meta name="keywords"> across all routes.
 *
 * Phase-1 BUG-07 stripped them at the lib level. This test rediscovers
 * every public URL from sitemap.xml (so adding a new route is enough
 * to bring it under test) and re-asserts the invariant.
 *
 * Also re-asserts the no-stray-Organization JSON-LD from SEO-03 — both
 * checks are cheap to run against the same HTML, so we batch them.
 */

async function urlsFromSitemap(request: import('@playwright/test').APIRequestContext): Promise<string[]> {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => new URL(m[1]).pathname);
}

test.describe('SEO-01 — zero <meta name="keywords"> across sitemap', () => {
  test('crawl every sitemap URL; assert zero keywords + zero stray Organization', async ({ request }) => {
    const paths = await urlsFromSitemap(request);
    expect(paths.length, 'sitemap unexpectedly empty').toBeGreaterThan(5);

    const failures: string[] = [];
    for (const path of paths) {
      const res = await request.get(path);
      if (res.status() !== 200) continue;
      const html = await res.text();

      if (/<meta[^>]+name=["']keywords["']/i.test(html)) {
        failures.push(`${path}: <meta name="keywords"> present`);
      }
      // No Organization or LocalBusiness in any JSON-LD. (Person is fine.)
      if (/"@type"\s*:\s*"Organization"/.test(html)) {
        failures.push(`${path}: JSON-LD still contains @type=Organization`);
      }
      if (/"@type"\s*:\s*"LocalBusiness"/.test(html)) {
        failures.push(`${path}: JSON-LD still contains @type=LocalBusiness`);
      }
    }

    expect(failures, failures.join('\n')).toEqual([]);
  });
});
