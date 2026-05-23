import { test, expect, type Page } from '@playwright/test';

/**
 * TRUST-04 — Person LD identity update.
 *
 * Phase-2 SEO-03 stood up Person LD with name="آلمانیار". Phase-3
 * promotes the real owner identity:
 *   name: "محمد جهانبانی"          (Mohammad Jahanbani)
 *   alternateName: "آلمانیار"      (brand alias kept for search)
 *   image: placeholder URL         (TRUST-02; swap to real photo later)
 *   affiliation: Medipol           (EducationalOrganization)
 *   sameAs: []                     (no social presence today)
 *   contactPoint.availableLanguage: ['fa','tr']
 */

async function extractPerson(page: Page) {
  return page.$$eval('script[type="application/ld+json"]', (scripts) => {
    for (const s of scripts) {
      try {
        const parsed = JSON.parse(s.textContent ?? '');
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item && item['@type'] === 'Person') return item;
        }
      } catch {
        /* ignore */
      }
    }
    return null;
  });
}

test.describe('TRUST-04 — Person LD identity', () => {
  test('Person has real owner identity, Medipol affiliation, empty sameAs', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
    const person = await extractPerson(page);

    expect(person, 'Person LD must be present').not.toBeNull();
    expect(person.name).toBe('محمد جهانبانی');
    expect(person.alternateName).toBe('آلمانیار');

    // Photo points at the placeholder filename (TRUST-02). Real-photo swap
    // updates OWNER_PHOTO_URL → new filename; this assertion changes with it.
    expect(person.image).toContain('mohammad-jahanbani-placeholder.svg');

    expect(person.affiliation).toEqual({
      '@type': 'EducationalOrganization',
      name: 'İstanbul Medipol Üniversitesi',
      url: 'https://www.medipol.edu.tr',
    });

    expect(person.sameAs, 'sameAs must be [] until real social channels live').toEqual([]);
    expect(person.contactPoint.availableLanguage).toEqual(['fa', 'tr']);

    // Broader knowsLanguage list keeps all four — reading/writing knowledge.
    expect(person.knowsLanguage).toEqual(['fa', 'tr', 'de', 'en']);
  });
});
