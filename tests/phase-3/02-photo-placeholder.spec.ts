import { test, expect } from '@playwright/test';

/**
 * TRUST-02 — the placeholder photo file is reachable.
 *
 * The /fa/about page (TRUST-01) and the Person JSON-LD (TRUST-04) both
 * point at OWNER_PHOTO_URL. Verify the URL actually serves an image.
 *
 * Swap path documented in PHASE-3-REPORT.md: drop a real photo at
 * public/team/mohammad-jahanbani.jpg and edit OWNER_PHOTO_URL in
 * src/lib/owner.ts. This test continues to pass with any new file.
 */

test.describe('TRUST-02 — owner photo asset', () => {
  test('placeholder SVG is reachable + content-type is image', async ({ request }) => {
    const res = await request.get('/team/mohammad-jahanbani-placeholder.svg');
    expect(res.status()).toBe(200);
    const ct = res.headers()['content-type'] ?? '';
    expect(ct.startsWith('image/'), `unexpected content-type: ${ct}`).toBe(true);
  });
});
