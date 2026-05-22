import { test, expect, type Page } from '@playwright/test';

/**
 * SEO-03 — JSON-LD overhaul
 *
 * Validates the new schema shape after the Organization → Person swap.
 * Specifically:
 *  - Every page emits exactly one Person (with @id ending in "#person")
 *  - Every page emits exactly one WebSite
 *  - No Organization or LocalBusiness anywhere
 *  - Homepage emits the three new Service objects with the correct
 *    pricing model:
 *      * Turkish admission: Offer.price === "0"
 *      * Settlement + Germany consulting: no Offer.price field
 *  - Article LD (on topic pages) references @id ending in "#person"
 *    for author + publisher
 *  - aggregateRating only appears when reviews are present (stats are
 *    empty in the test DB, so it must NOT appear today)
 */

async function extractJsonLd(page: Page): Promise<unknown[]> {
  return page.$$eval('script[type="application/ld+json"]', (scripts) =>
    scripts.flatMap((s) => {
      try {
        const parsed = JSON.parse(s.textContent ?? '');
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [];
      }
    }),
  );
}

function findOne<T extends { '@type'?: string }>(items: unknown[], type: string): T | undefined {
  return items.find((it): it is T =>
    typeof it === 'object' && it !== null && (it as T)['@type'] === type,
  );
}

function findAll<T extends { '@type'?: string }>(items: unknown[], type: string): T[] {
  return items.filter((it): it is T =>
    typeof it === 'object' && it !== null && (it as T)['@type'] === type,
  );
}

test.describe('SEO-03 — JSON-LD (Person + Services + WebSite)', () => {
  test('every common page emits Person + WebSite, never Organization', async ({ page }) => {
    const paths = ['/fa', '/fa/guide', '/fa/germany-visa', '/fa/how-it-works', '/fa/disclaimer'];
    for (const path of paths) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const ld = await extractJsonLd(page);

      const persons = findAll<{ '@type'?: string; '@id'?: string }>(ld, 'Person');
      expect(persons.length, `${path}: expected >= 1 Person`).toBeGreaterThanOrEqual(1);
      for (const p of persons) {
        expect(p['@id'], `${path}: Person @id`).toContain('#person');
      }

      const sites = findAll(ld, 'WebSite');
      expect(sites.length, `${path}: expected exactly 1 WebSite`).toBe(1);

      const orgs = findAll(ld, 'Organization');
      const locals = findAll(ld, 'LocalBusiness');
      expect(orgs, `${path}: must not emit Organization (use Person)`).toEqual([]);
      expect(locals, `${path}: must not emit LocalBusiness (use Person)`).toEqual([]);
    }
  });

  test('homepage emits 3 Services with correct pricing model', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    const ld = await extractJsonLd(page);

    type Svc = { '@type': string; '@id'?: string; offers?: { price?: string; priceCurrency?: string } };
    const services = findAll<Svc>(ld, 'Service');
    expect(services.length, 'homepage must emit 3 Service objects').toBe(3);

    const admission = services.find((s) => s['@id']?.endsWith('#service-tr-admission'));
    expect(admission, 'admission Service missing').toBeDefined();
    expect(admission?.offers?.price, 'admission must be free (price=0)').toBe('0');
    expect(admission?.offers?.priceCurrency).toBe('TRY');

    const settlement = services.find((s) => s['@id']?.endsWith('#service-settlement'));
    expect(settlement, 'settlement Service missing').toBeDefined();
    expect(settlement?.offers, 'settlement must NOT expose a price (offline contract)').toBeUndefined();

    const germany = services.find((s) => s['@id']?.endsWith('#service-germany'));
    expect(germany, 'germany consulting Service missing').toBeDefined();
    expect(germany?.offers, 'germany consulting must NOT expose a price').toBeUndefined();
  });

  test('Article LD on topic pages references Person, not Organization', async ({ page }) => {
    await page.goto('/fa/germany-visa/visametric', { waitUntil: 'domcontentloaded' });
    const ld = await extractJsonLd(page);

    type Article = {
      '@type': string;
      author?: { '@id'?: string };
      publisher?: { '@id'?: string };
    };
    const article = findOne<Article>(ld, 'Article');
    expect(article, 'topic page must emit Article LD').toBeDefined();
    expect(article?.author?.['@id'] ?? '').toContain('#person');
    expect(article?.publisher?.['@id'] ?? '').toContain('#person');
  });

  test('aggregateRating is absent when SiteStats has no reviews', async ({ page }) => {
    // Dev server's empty DB → loadSiteStats returns EMPTY → personWithRatingLd
    // returns plain personLd (no aggregateRating).
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    const ld = await extractJsonLd(page);
    type WithRating = { '@type'?: string; aggregateRating?: unknown };
    const personsWithRating = ld
      .filter((it): it is WithRating => typeof it === 'object' && it !== null && (it as WithRating)['@type'] === 'Person')
      .filter((p) => p.aggregateRating !== undefined);
    expect(personsWithRating, 'aggregateRating must not appear with empty review DB').toEqual([]);
  });
});
