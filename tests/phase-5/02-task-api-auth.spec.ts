import { test, expect } from '@playwright/test';

/**
 * Phase-5 TASK-02/03 — auth gates on workspace endpoints.
 *
 * Like Phase-4's notify suite, the behavioural assertion here is the
 * API-layer gate: unauthenticated requests must be rejected before
 * any DB work happens. The full happy-path (admin creates → student
 * ticks → admin confirms) is exercised on the live VPS via the
 * verification checklist in PHASE-5-REPORT.md.
 */
test.describe('Phase-5 — task endpoint auth gates', () => {
  test('student-tick requires an authenticated user', async ({ request }) => {
    const res = await request.post(
      '/api/applications/anyappid/tasks/anytaskid/student-tick',
      { data: { done: true } },
    );
    // requireUser() returns 401 for no/invalid session.
    expect([401, 403]).toContain(res.status());
  });

  test('admin task POST requires admin', async ({ request }) => {
    const res = await request.post('/api/admin/applications/anyappid/tasks', {
      data: { title: 'x' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('admin task PATCH requires admin', async ({ request }) => {
    const res = await request.patch('/api/admin/tasks/anytaskid', {
      data: { title: 'x' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('admin task DELETE requires admin', async ({ request }) => {
    const res = await request.delete('/api/admin/tasks/anytaskid');
    expect([401, 403]).toContain(res.status());
  });

  test('admin reorder requires admin', async ({ request }) => {
    const res = await request.patch('/api/admin/tasks/reorder', {
      data: { applicationId: 'anyappid', items: [{ id: 'x', order: 0 }] },
    });
    expect([401, 403]).toContain(res.status());
  });
});
