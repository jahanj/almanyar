import { test, expect } from '@playwright/test';

/**
 * Phase-8B/C — admin post endpoints require an authenticated admin.
 *
 * Same pattern as Phase-4/5 auth-gate suites: assert the API layer
 * rejects unauthenticated requests. Full CRUD happy-path runs on the
 * live VPS via the manual checklist in PHASE-8-REPORT.md.
 */
test.describe('Phase-8 — admin post endpoint auth', () => {
  test('GET /api/admin/posts requires admin', async ({ request }) => {
    const res = await request.get('/api/admin/posts');
    expect([401, 403]).toContain(res.status());
  });

  test('POST /api/admin/posts requires admin', async ({ request }) => {
    const res = await request.post('/api/admin/posts', {
      data: { title: 'x', categoryId: 'cat_news_updates_v1' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('PATCH /api/admin/posts/[id] requires admin', async ({ request }) => {
    const res = await request.patch('/api/admin/posts/anyid', { data: { title: 'x' } });
    expect([401, 403]).toContain(res.status());
  });

  test('DELETE /api/admin/posts/[id] requires admin', async ({ request }) => {
    const res = await request.delete('/api/admin/posts/anyid');
    expect([401, 403]).toContain(res.status());
  });

  test('GET /api/admin/post-categories requires admin', async ({ request }) => {
    const res = await request.get('/api/admin/post-categories');
    expect([401, 403]).toContain(res.status());
  });

  test('GET /api/admin/internal-links requires admin', async ({ request }) => {
    const res = await request.get('/api/admin/internal-links');
    expect([401, 403]).toContain(res.status());
  });

  test('POST /api/admin/uploads/image requires admin', async ({ request }) => {
    const res = await request.post('/api/admin/uploads/image', { multipart: {} });
    expect([401, 403]).toContain(res.status());
  });
});
