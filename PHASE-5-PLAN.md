# Phase 5 — Co-managed Student Workspace Panel

> Read-only exploration done; no production code touched yet.
> Approve before I write anything.

---

## 1. Where existing code leaves us (good news — lots of scaffolding)

Phase-5 is mostly NEW, but a significant amount of foundation is already in place:

| Surface | Status |
|---|---|
| `User`, `Application`, `Document` models | ✅ exist; `Application.status` enum covers DRAFT/SUBMITTED/UNDER_REVIEW/DOCUMENTS_REQUESTED/APPROVED/REJECTED/COMPLETED |
| `/dashboard` page | ✅ exists at 241 lines (`DashboardClient.tsx`) — user can create Applications, upload Documents, see review status |
| `/admin/applications` page | ✅ exists — admin can edit `adminNotes`, set status, review docs (approve/reject with note) + Phase-4 «📧 ارسال به مشتری» button |
| User-side `/api/applications` + `/api/documents/[id]/file` | ✅ exist |
| Admin-side `/api/admin/applications`, `/api/admin/documents` | ✅ exist |
| Email pipeline | ✅ verification, admin-notify (Phase 4), marketing-welcome (Phase 4) |
| Notification audit (`AdminEmailLog`) | ✅ exists |
| `/fa/disclaimer` + `/fa/privacy` | ✅ Phase 2 |

**What's genuinely missing (this phase):**

| Missing piece | Why it's needed |
|---|---|
| `Task` model | The roadmap. An Application becomes a workspace by holding N ordered Tasks. |
| Two-way ticking | Brief §۵: both user AND admin can tick. |
| Per-task doc binding | A task can require a specific `DocumentCategory`; uploading that category auto-progresses the task. |
| Dynamic progress % | Computed `done / total`. |
| Automatic notifications | When admin adds a task / approves a doc / marks task done → user email. Brief §۵. |
| Admin "edit roadmap" UI | Currently admin only edits notes/status. Needs add/edit/reorder/delete task UI. |
| Student "روند" / roadmap view | DashboardClient currently shows docs+apps; needs a vertical task timeline with progress bar. |
| Homepage landing section | A new component near TrustModel describing the free panel + CTA «ورود به پنل». |
| In-panel disclaimer banner | Brief §۹: panel itself displays the «ابزار سازماندهی، نه وکالت مهاجرت» line. |

---

## 2. Strategic decisions — surface up-front

1. **Task model shape**. I'll add a single `Task` table tied to `Application`. Each Task has:
   - `order`        — int, for sorted display
   - `title` + `description` (Persian)
   - `category`     — enum (UNIVERSITY_REGISTRATION / RESIDENCE_PERMIT / HEALTH_INSURANCE / BANK_ACCOUNT / SPERRKONTO / MONEY_TRANSFER / DOCUMENT_TRANSLATION / EMBASSY_APPOINTMENT / OTHER)
   - `status`       — enum (PENDING / IN_PROGRESS / DONE / BLOCKED)
   - `requiredDocCategory` — optional `DocumentCategory` enum; binds to existing Document upload
   - `studentTicked`/`studentTickedAt`  — user "I did it"
   - `adminTicked`/`adminTickedAt`      — admin confirms
   - `dueDate?`                          — optional
   - `createdAt`/`updatedAt`

2. **What counts as "DONE"** (decision §6.A): **admin-tick is canonical**. The student tick is a *signal* ("I did my part") that turns the row amber on the admin side and triggers a notification; the admin still has to confirm-tick for `status=DONE`. Mirrors the existing Document review flow (PENDING → APPROVED only on admin action).

3. **Templates: defer**. v1 ships with the admin manually adding tasks one-by-one or pasting from a list. Once we see real cases we can codify 2-3 templates as a follow-up. Brief §۵ doesn't require templates in v1. Decision §6.B.

4. **Notifications: per-event, capped + a small preference**. Each trigger sends one Persian email immediately:
   - `task.created` (admin → student): «یک گام جدید به روند شما اضافه شد».
   - `task.reviewed` (admin marks done): «یک گام از روند شما تأیید شد. پیشرفت: X٪».
   - `document.reviewed` (admin approves/rejects a doc): «وضعیت مدرک شما به‌روزرسانی شد» (already exists conceptually for adminNotes — extend to docs).
   - `task.studentTicked` (student tick): owner-only — «دانشجو … اعلام کرد گام «…» را انجام داده، نیازمند تأیید است».
   - Cap: ≤5 student-facing emails / day / Application (rate-limit table). New `User.notificationDailyDigest: bool` flag — defer the digest implementation to a follow-up; the flag lands now so the UI can offer it on day 1. Decision §6.C.

5. **Comments per task: defer**. Brief §۵ doesn't list them. A simpler `Application.adminNotes` already exists and the Phase-4 «📧 ارسال به مشتری» button delivers them. Decision §6.D.

6. **UI architecture**:
   - **Student dashboard**: `DashboardClient` gets a tabbed shell — *روند* (the new task list) / *مدارک* (existing doc list) / *پرونده* (status + admin notes summary). Default tab = روند. Each Application gets its own URL: `/dashboard/cases/[id]` (sub-route) for shareable links + cleaner mobile UX. Decision §6.F.
   - **Admin panel**: existing `/admin/applications` keeps its current card layout; clicking «ویرایش روند» opens an in-card task editor (add/edit/reorder/delete). No new top-level admin page.

7. **Landing section**: a new `<PanelLanding />` component on the homepage, between `TrustModel` and `Services`. Persian copy: «همراهی روزانه با یک پنل اختصاصی — رایگان». CTA: «وارد پنل شوید» → `/dashboard` (which already redirects to `/login` if not authed). Decision §6.E.

8. **Disclaimer**:
   - Small inline banner at the top of the dashboard + admin pages: «این پنل صرفاً ابزار سازماندهی است. آلمانیار وکیل مهاجرت نیست و هیچ تضمینی درباره نتیجه ویزا یا پذیرش دانشگاه نمی‌دهد. [بیشتر بخوانید](/fa/disclaimer)».
   - One-line disclaimer at the bottom of every notification email («یادآوری: …»).

9. **Mobile-first**: brief §۸. Task list collapses to a vertical accordion on mobile. The existing site is already mobile-first; reuse the same shadcn-free Radix + Tailwind patterns Phase-1/2 established.

10. **No paid features, no upsells in the panel itself** — brief §۶: the panel is the trust-builder; conversion to paid services happens through the existing site CTAs (WhatsApp, evaluation form).

---

## 3. Per-task plan

### TASK-01 — Schema: `Task` model + `TaskStatus` + `TaskCategory` enums + migration
Additive only. New table `Task` with FK to `Application` (cascade). New enums.
Plus: `User.notificationDailyDigest: Boolean? @default(false)` (lands the column now so future digest mode has its preference home).
Plus: `EmailRateLimit` table (lightweight: `userId`, `kind`, `sentAt`) used by the per-event notification cap.
Migration: `20260524_phase5_workspace`.
**Risk**: low — additive.

### TASK-02 — API: user-side roadmap + tick endpoint
- `GET  /api/applications/[id]` — extends existing route to include `tasks` ordered by `order asc`.
- `POST /api/applications/[id]/tasks/[taskId]/student-tick` — student says "I did it".
  - Body: `{ done: boolean }`. Toggles `studentTicked`/`studentTickedAt`.
  - Triggers a `task.studentTicked` notification to the owner (rate-limited).
- Auth: `requireUser`, validate the task's Application belongs to the caller.
**Risk**: low.

### TASK-03 — API: admin CRUD for tasks
- `GET    /api/admin/applications/[id]` — extends to include tasks.
- `POST   /api/admin/applications/[id]/tasks` — create task. Triggers `task.created` notification (rate-limited).
- `PATCH  /api/admin/tasks/[id]` — edit title/desc/order/category/requiredDocCategory/dueDate/status. Admin-tick fires `task.reviewed` if it crosses `status=DONE`.
- `DELETE /api/admin/tasks/[id]` — remove.
- `PATCH  /api/admin/tasks/reorder` — batch reorder (one round-trip when drag-reordering).
**Risk**: medium (5 endpoints; reorder needs care to not race).

### TASK-04 — Notifications: extend the existing pipeline
- `src/lib/notify.ts` — new wrapper that:
  - Checks the `EmailRateLimit` table for the (`userId`, `kind`) pair.
  - Renders one of 4 Persian templates via small functions in `src/lib/email-templates.ts`.
  - Calls `sendMail()` (existing).
  - Writes to `AdminEmailLog` (existing, sufficient for Phase 4's audit shape).
- Each template carries the «ابزار سازماندهی است، نه وکالت» disclaimer line in the footer.
- Notification triggers wired into TASK-02 + TASK-03 endpoints (single source of trigger logic per event).
**Risk**: low — extends the existing mailer.

### TASK-05 — Student UI: tabbed dashboard + roadmap view
- `DashboardClient.tsx` refactor to a 3-tab shell (روند / مدارک / پرونده).
- New `RoadmapTimeline.tsx` — vertical timeline rendering tasks with check states, progress bar, "I did this" buttons, doc-upload affordance per task when `requiredDocCategory` is set.
- New `/dashboard/cases/[id]/page.tsx` — sub-route for a single Application's workspace (shareable URL).
- The current top-level `/dashboard` becomes a chooser if user has multiple Applications, else auto-redirects to the single Application's case URL.
- Inline disclaimer banner at the top.
**Risk**: medium — biggest UI delta.

### TASK-06 — Admin UI: edit roadmap on existing application card
- Extend `src/app/admin/applications/page.tsx`: when card is open, new «روند» section above documents.
- New `<AdminTaskEditor />` component: add task (inline form), edit in place, drag-reorder (hand-built — no new dep; HTML5 drag is acceptable for v1; could swap to `@dnd-kit` later), delete with confirm.
- Admin-tick toggle inline.
- Inline disclaimer banner at the top of admin pages.
**Risk**: medium — drag UX is non-trivial; v1 can ship with up/down arrow buttons + add reorder later if drag turns out clunky.

### TASK-07 — Homepage landing section
- New `<PanelLanding />` component, mounted between `TrustModel` and `Services` in `HomeClient.tsx`.
- Persian copy block: title «پنل اختصاصی شما — رایگان»; 3-bullet promise (شخصی‌سازی‌شده / دوطرفه / تمام‌مراحل ترکیه); CTA «ورود به پنل» → `/login?callbackUrl=/dashboard` (the existing auth flow handles routing).
- Adds nothing to JSON-LD (it's a feature pitch, not a separate entity).
**Risk**: low.

### TASK-08 — Tests + report
- Specs in `tests/phase-5/`:
  - `01-task-api.spec.ts` — user can't access another user's tasks; tick toggles persist
  - `02-admin-task-crud.spec.ts` — unauthenticated rejected; happy path create/edit/delete shape
  - `03-roadmap-render.spec.ts` — student dashboard renders tasks + progress %
  - `04-panel-landing.spec.ts` — homepage section renders + CTA points at /login
  - `05-disclaimer-in-panel.spec.ts` — banner visible on dashboard + admin
- Following [[feedback-test-runs]]: write specs inline, batch-run at end.

---

## 4. Order of execution

1. TASK-01 (schema + migration)
2. TASK-02 (user API)
3. TASK-03 (admin API)
4. TASK-04 (notifications)
5. TASK-06 (admin UI — built first because real test data needs admin to create tasks)
6. TASK-05 (student UI — depends on admin having created some tasks for visual QA)
7. TASK-07 (homepage landing)
8. TASK-08 (tests + PHASE-5-REPORT.md)

Each step ends with a focused commit + tsc clean.

---

## 5. Estimated scope

8 commits. ~30 new files: 1 lib (`notify.ts`), 1 schema file edit + 1 migration, ~6 API routes, ~5 UI components (RoadmapTimeline, TaskItem, AdminTaskEditor, PanelLanding, plus a shared TaskStatusChip), and the 5 test specs. Maybe 1500–2000 LOC, similar shape to Phase-3.

**Out of scope** (deferred to a future phase if/when needed): templates, per-task comments, drag-reorder polish, daily digest mode implementation, bulk admin actions, in-panel push notifications, mobile push.

---

## 6. Open decisions — please ack (6 items)

| # | Question | My default | Override |
|---|---|---|---|
| **A** | Two-way tick: admin-tick = canonical DONE; student-tick = signal only. | Yes | Reply "both ticks required for DONE" |
| **B** | Templates: ship v1 without templates (admin adds tasks manually); add 2-3 templates later when real cases are seen. | Yes | Reply with which templates you want pre-built now |
| **C** | Notifications: per-event, capped at 5/student/day; digest flag column lands now, digest implementation deferred. | Yes | Reply "daily digest from day 1" |
| **D** | Task comments: defer. The Phase-4 «📧 ارسال به مشتری» button on adminNotes covers most use cases. | Yes | Reply "include task comments" |
| **E** | Landing section position: between TrustModel and Services. | Yes | Reply with another section |
| **F** | URL structure: `/dashboard/cases/[id]` sub-route per Application; top-level `/dashboard` becomes a chooser. | Yes | Reply "single-page tabs only" |

---

## 7. Rollback strategy

| Layer | Rollback |
|---|---|
| Per-task commits | `git revert <sha>`. Each is self-contained. |
| Migration `20260524_phase5_workspace` | Additive only. Rollback = drop Task table + drop EmailRateLimit table + drop User.notificationDailyDigest column + drop the 2 enums. |
| Notification pipeline | Built as a thin extension over the existing `sendMail`. Reverting the new helper removes the new emails without touching verification/marketing/admin-notify flows. |
| UI | `<RoadmapTimeline>` and `<AdminTaskEditor>` are new components; reverting removes them. `DashboardClient` refactor is the only existing-file change with risk — kept in its own commit. |
| Public surface | `<PanelLanding>` is a one-line mount in HomeClient. |

---

## 8. What I need from you to proceed

1. Ack on **A–F** in §6 (or override individually).
2. Confirm I should not also ship Phase 4 to production before starting Phase 5 (currently pushed to GitHub but VPS is still on Phase 3).
3. Say "go" — I start with **TASK-01 (schema + migration)**.

---

## 9. Phase 4 deploy reminder (separate question)

Phase 4 is pushed to GitHub but the VPS is still on Phase 3. The new
universities marquee, admin notify button, marketing opt-in,
copy/cinematic fixes — none are live yet.

You can:
- **Ship Phase 4 now**, then start Phase 5.
- **Hold Phase 4 + Phase 5 together** for one bigger deploy at the end of Phase 5.
- **Hold Phase 4 indefinitely** (e.g. while waiting for owner photo / university logos).

Tell me which, in addition to the §6 acks. (My slight preference: ship Phase 4 first — small, well-tested, gets the migrations onto production now so Phase 5's migrations only touch a single fresh state when it's their turn.)
