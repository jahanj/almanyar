import { expect, test } from '@playwright/test';

// (old path → new path) pairs we expect 301s for.
const REDIRECTS: Array<[string, string]> = [
  ['/germany-visa',                                 '/fa/germany-visa'],
  ['/germany-visa/visametric',                      '/fa/germany-visa/visametric'],
  ['/germany-visa/requirements',                    '/fa/germany-visa/requirements'],
  ['/germany-visa-from-turkey',                     '/fa/germany-visa-from-turkey'],
  ['/study-germany',                                '/fa/study-germany'],
  ['/study-germany/student-visa',                   '/fa/study-germany/student-visa'],
  ['/work-germany',                                 '/fa/work-germany'],
  ['/work-germany/eu-blue-card',                    '/fa/work-germany/eu-blue-card'],
  ['/jobs-germany/in-demand-jobs',                  '/fa/jobs-germany/in-demand-jobs'],
  ['/life-germany/housing',                         '/fa/life-germany/housing'],
  ['/exams',                                        '/fa/exams'],
  ['/exams/dsh',                                    '/fa/exams/dsh'],
  ['/ausbildung/visa',                              '/fa/ausbildung/visa'],
  ['/germany-embassy/tehran',                       '/fa/germany-embassy/tehran'],
  ['/services/germany-visa',                        '/fa/services/germany-visa'],
  ['/faq/germany-visa',                             '/fa/faq/germany-visa'],
];

test.describe('BUG-01 — URL i18n + redirects', () => {
  test('every legacy URL returns 301 to its /fa/* equivalent', async ({ request }) => {
    for (const [from, to] of REDIRECTS) {
      const r = await request.get(from, { maxRedirects: 0 });
      expect(r.status(), `${from} should 301`).toBe(308); // Next emits 308 for permanent: true
      expect(new URL(r.headers().location!, 'http://x').pathname, `${from} → ${to}`).toBe(to);
    }
  });

  test('every new URL returns 200', async ({ request }) => {
    for (const [, to] of REDIRECTS) {
      const r = await request.get(to);
      expect(r.status(), `${to} should be 200 — was ${r.status()}`).toBe(200);
    }
  });

  test('un-prefixed auth/dashboard/admin routes still resolve (not redirected)', async ({ request }) => {
    // These are intentionally NOT under /fa — see PHASE-1-PLAN §5.A.
    for (const p of ['/login', '/register', '/forgot-password']) {
      const r = await request.get(p);
      expect([200, 307], `${p} unexpected status ${r.status()}`).toContain(r.status());
    }
  });
});
