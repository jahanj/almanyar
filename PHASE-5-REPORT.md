# Phase 5 — Co-managed Student Panel (Implementation Report)

**Date:** 2026-05-24
**Status:** Implemented locally, ready for deployment.
**Tests run live:** No (deferred per session preference). Spec files
land in `tests/phase-5/` and join the batch suite via
`playwright.config.ts`.

---

## What shipped

| # | Commit (short) | Scope |
|---|---|---|
| TASK-01 | `839c05f` | Prisma: `Task` model, `EmailRateLimit`, `TaskStatus`/`TaskCategory` enums, `User.notificationDailyDigest` (default false). Migration `20260524_phase5_workspace`. |
| TASK-02 | `0fbbd26` | `GET /api/applications` returns each application's `tasks`. `POST /api/applications/[id]/tasks/[taskId]/student-tick` — idempotent, 404 on cross-user (no existence leak), no status flip. |
| TASK-03 | `71d4244` | Admin CRUD: `POST /api/admin/applications/[id]/tasks` (auto-order), `PATCH /api/admin/tasks/[id]` (adminTicked syncs status), `DELETE /api/admin/tasks/[id]`, `PATCH /api/admin/tasks/reorder` (transactional, single-app scope). `GET /api/admin/applications` now includes tasks. |
| TASK-04 | `d8b1a76` | `src/lib/notify.ts`: cap of 5 / userId / kind / case / 24h via `EmailRateLimit`. Four kinds wired: `task.studentTicked` (admin), `task.added` (student), `task.adminTicked` (student), `task.blocked` (student). SMTP failure logged, never thrown. |
| TASK-05 | `00a4eb4` | `RoadmapTimeline` component + inline rendering in `DashboardClient`. Focused sub-route `/dashboard/cases/[id]` with progress bar. Cross-user → 404, not 403. |
| TASK-06 | `aa9197b` | `AdminTaskEditor`: inline add / edit / delete, up-down arrow reorder (no drag-deps), per-task `adminTicked` checkbox + status dropdown. Wired into `/admin/applications`. |
| TASK-07 | `a09e2bc` | `PanelLanding` static section on `/fa` between `TrustModel` and `Services` — two paired mock cards (مشاور / شما), CTA → `/login?callbackUrl=/dashboard`. |

---

## Decisions honored (from PHASE-5-PLAN A–F)

- **A — adminTick = canonical DONE.** Student-tick is informational
  only; never flips `Task.status`. `PATCH /admin/tasks` sets
  `status='DONE'` automatically on the `adminTicked` true→true edge
  unless the caller explicitly passes a status (which wins).
- **B — templates deferred.** No template library; admin types each
  task from scratch.
- **C — per-event notifications, 5/day cap.** Implemented in
  `lib/notify.ts`; ledger key is `${kind}:${applicationId}` so a
  noisy "task.added" run on Case A doesn't crowd out a single
  "task.adminTicked" on Case B. `User.notificationDailyDigest`
  column landed for the future digest worker.
- **D — task comments deferred.** Not implemented.
- **E — landing between TrustModel and Services.** ✅
- **F — `/dashboard/cases/[id]` sub-routes.** Server-rendered focused
  view per case with progress bar; the main `/dashboard` keeps the
  inline timeline so casual visits don't require an extra click.

---

## Tests

New specs in `tests/phase-5/`:
1. `01-panel-landing.spec.ts` — section + both mock views + CTA on `/fa`.
2. `02-task-api-auth.spec.ts` — every workspace endpoint rejects
   unauthenticated requests (401/403).
3. `03-dashboard-redirects.spec.ts` — `/dashboard/cases/[id]` bounces
   anonymous visitors to `/login?callbackUrl=…`.

`playwright.config.ts` extended to include `phase-5/**/*.spec.ts`.

Live happy-path (admin creates → student ticks → admin confirms → email
arrives) **not** automated — same pattern as Phase 4's admin-notify
suite: requires a logged-in admin session the test env doesn't have.
Verify manually post-deploy:

### Manual verification checklist (run on live)
1. Log in as admin → `/admin/applications` → expand a case → add a task.
   Confirm the task POST returns 201 and the customer receives a
   "گام جدید" email.
2. Log in as the customer (different browser) → `/dashboard` → see the
   new task in the inline timeline.
3. Tick "این گام را انجام دادم" → admin email arrives ("گام انجام شد").
4. As admin, tick the `تأیید انجام (DONE)` checkbox → the task badge
   flips to "انجام شد" and the customer receives "گام تأیید شد ✅".
5. Set a task's status to `BLOCKED` → customer receives "نیاز به اقدام".
6. Rapid-fire 6 ticks on the same kind+case → only the first 5 send
   (rate limit), no SMTP error surfaces in the admin UI.
7. Cross-user probe: as customer A try
   `POST /api/applications/<B-id>/tasks/<B-task-id>/student-tick` —
   expect 404 (not 403).
8. Homepage `/fa` — confirm `PanelLanding` renders between TrustModel
   and Services and the CTA opens `/login?callbackUrl=/dashboard`.

---

## Deployment notes

- Single new migration `20260524_phase5_workspace` — additive, no
  destructive changes. Existing rows are unaffected (`Task` is a new
  table; `User.notificationDailyDigest` defaults to false).
- No new env vars required. `ADMIN_NOTIFY_EMAIL` (already set in
  Phase 4) is reused for the `task.studentTicked` notifier; if it's
  missing the notifier returns `{ sent: false, reason: 'no_admin_email' }`
  without throwing.
- No new external deps.

---

## Known follow-ups (out of scope this phase)

- Daily digest worker — column landed; cron/worker not implemented.
- Task comments — Decision D deferred.
- `requiredDocCategory` is stored but not yet surfaced in
  `RoadmapTimeline`; future iteration can link a task to an existing
  upload and offer an inline upload CTA.
- Drag-and-drop reorder — up/down arrows ship today; drag is a
  future enhancement once volume justifies the dep.
