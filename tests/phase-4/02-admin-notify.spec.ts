import { test, expect } from '@playwright/test';

/**
 * Phase-4 §4 — admin notify-customer endpoints.
 *
 * The behavioural assertion is the API-layer gate: unauthenticated
 * POSTs must be rejected. Walking the admin UI requires a logged-in
 * admin session which the test env doesn't have — the rest of the
 * behaviour (404 on missing lead, 400 on empty message, 429 on rate
 * limit, 502 on SMTP-not-configured) is exercised on the live VPS by
 * the manual verification checklist in PHASE-4-REPORT.md.
 */
test.describe('Phase-4 — admin notify endpoints', () => {
  for (const path of [
    '/api/admin/contacts/nonexistent/notify',
    '/api/admin/evaluations/nonexistent/notify',
    '/api/admin/applications/nonexistent/notify',
  ]) {
    test(`${path} rejects unauthenticated POST`, async ({ request }) => {
      const res = await request.post(path, { data: {} });
      // requireAdmin() returns 401 unauthorized for non-admin / no session.
      expect([401, 403]).toContain(res.status());
    });
  }
});
