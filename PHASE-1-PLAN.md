# Phase 1 — Critical Bug Fix Plan

> Read‑only audit only. **No production code has been written yet.**
> Approve this plan before I touch any source file.

---

## 1. Detected stack & architecture

| Layer | What's actually here |
|---|---|
| Framework | Next.js **14.2.35**, **App Router**, `output: 'standalone'` (Dockerized) |
| Language | TypeScript 5.6, React 18.3 |
| Styling | Tailwind 3.4 (no shadcn/ui yet, no Radix, no lucide-react) |
| Animation | gsap 3.15 (`CinematicJourneyHero`) |
| Auth | next-auth 4.24 |
| Data | Prisma 5.22 + Postgres 16 |
| i18n | **Custom**, single locale `fa`. `src/lib/i18n.ts` defines `Locale = 'fa'` only. Dictionaries in `src/locales/fa.ts`. **No `next-intl`.** |
| Hosting | Self-hosted Docker on a Hetzner-style VPS (`/opt/germanbiz`); nginx → Next standalone → Postgres |
| Deploy | Manual: `rsync` + `./deploy.sh` (`docker compose up -d --build`) |
| Email | nodemailer (`src/lib/`), SMTP env vars present |
| Forms | Plain React state — **no zod, no react-hook-form, no Resend** yet |

### Routing reality (this is the heart of Phase 1)
The app dir is **half-migrated**. Some routes already live under `[locale]/`, most do not:

| Path | Where it lives | Status |
|---|---|---|
| `/`            | `src/app/page.tsx` (redirects → `/fa`) | OK |
| `/fa`          | `src/app/[locale]/page.tsx` | OK |
| `/fa/guide`            | `src/app/[locale]/guide` | OK |
| `/fa/evaluation`       | `src/app/[locale]/evaluation` | OK |
| `/fa/turkey-costs`     | `src/app/[locale]/turkey-costs` | OK |
| `/fa/turkey-residence` | `src/app/[locale]/turkey-residence` | OK |
| `/fa/exams`            | `src/app/[locale]/exams/page.tsx` (bespoke landing w/ `ExamRegisterForm`) | OK |
| `/fa/germany-visa-from-turkey` | `src/app/[locale]/germany-visa-from-turkey/page.tsx` — **actively `permanentRedirect`s back to `/germany-visa-from-turkey`** | inverted, must fix |
| `/germany-visa-from-turkey` | `src/app/germany-visa-from-turkey/page.tsx` | unlocalized |
| `/germany-visa/*`      | `src/app/germany-visa/[[...slug]]/page.tsx` → `topicRoute('germany-visa')` | unlocalized |
| `/study-germany/*`     | `src/app/study-germany/[[...slug]]/page.tsx` | unlocalized |
| `/work-germany/*`      | `src/app/work-germany/[[...slug]]/page.tsx` | unlocalized |
| `/jobs-germany/*`      | `src/app/jobs-germany/[[...slug]]/page.tsx` | unlocalized |
| `/life-germany/*`      | `src/app/life-germany/[[...slug]]/page.tsx` | unlocalized |
| `/exams/[slug]`        | `src/app/exams/[[...slug]]/page.tsx` (topic-route subpages — e.g. `/exams/dsh`) | unlocalized, **conflicts conceptually** with `/fa/exams` |
| `/ausbildung/*`        | `src/app/ausbildung/[[...slug]]/page.tsx` | unlocalized |
| `/germany-embassy/*`   | `src/app/germany-embassy/[[...slug]]/page.tsx` | unlocalized |
| `/services/*`          | `src/app/services/[[...slug]]/page.tsx` | unlocalized |
| `/faq/*`               | `src/app/faq/[[...slug]]/page.tsx` | unlocalized |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` | auth pages at root | unlocalized (kept that way per spec — see §5) |
| `/dashboard`, `/admin/*` | user/admin areas | unlocalized (kept that way — see §5) |

All non-locale topic pages share **one engine**: `src/lib/topic-route.tsx`. Fixing the engine fixes all of them at once.

### Component reality
- `Header.tsx`, `Footer.tsx` are imported **manually inside each page file**. The `[locale]/layout.tsx` only sets `dir/lang` — it does not render Header/Footer. That's what lets header/footer drift.
- `FaqAccordion.tsx:19` renders a literal `+` character as the toggle icon. Confirmed root cause of **BUG-04**.
- `EvaluationWizard.tsx:57–61` hard-codes 18 Iranian provinces; no country picker, no localStorage. Confirmed root cause of **BUG-06**.
- `HomeClient.tsx` pulls `averageRating`/`totalReviews` from `prisma.review.aggregate` on a fresh DB they're `0` / `0` — the cinematic AlmanYar scene then unconditionally renders `<Counter target={0} />` + a `★ ۵.۰ بر اساس ۰ نظر` link. Confirmed root cause of **BUG-03**.
- `topic-route.tsx:46` truncates metadata description with a hard `.slice(0, 160)` — mid-word cuts. `rootPageMetadata` forwards a `keywords` field to Next's `Metadata`, which emits `<meta name="keywords">`. Confirmed root cause of **BUG-07**.
- `topic-route.tsx:101–103` renders the visible breadcrumb middle link as `localePath(locale, '/' + segment)` → `/fa/germany-visa`, while the JSON‑LD breadcrumb uses `absoluteUrl('/' + segment)` → `/germany-visa`. The visible link 404s because the page actually lives at `/germany-visa`. Confirmed root cause of **BUG-02**.

---

## 2. Strategic decisions (call these out now — won't change mid-flight)

1. **Keep the custom i18n, do not install `next-intl`.** A swap to `next-intl` would touch metadata, layouts, and the dictionary import path in dozens of files — Phase-1 scope explicitly bans new features and risks. The custom system already has `[locale]` segment support; we just need to migrate the remaining route folders into it.
2. **Locale prefix scope: `/fa` covers public marketing/content pages only.** Auth (`/login`…), `/dashboard`, `/admin/*`, and `/api/*` stay un-prefixed — they're functional surfaces, not SEO targets, and changing them would break NextAuth callback URLs that are already deployed (and any external email links). The spec's "every page is at /fa/*" line is interpreted as "every indexable public page". Will surface this for explicit confirmation before BUG-01 starts.
3. **Single dynamic segment for topic slugs.** All 33 `TOPICS` are exactly 2 path segments (`/group/slug`). After the move, the new structure is `/[locale]/<group>/[slug]/page.tsx` (a single `[slug]`, not `[[...slug]]`). The group index page (`/fa/germany-visa`) becomes its own `page.tsx` next to it. This is cleaner than the current `[[...slug]]` and removes the ambiguity that bit us at `/exams`.
4. **`/tr` and `/en` reserved**: middleware will `notFound()` them, *not* match them as catch-all locales (per spec). `locales` array in `i18n.ts` stays `['fa']`.
5. **301 redirects** are emitted from `next.config.js#redirects()` so they survive across deploys and don't depend on middleware execution.
6. **Database changes are additive.** New `SiteStats` model only — no edits to existing tables. Migration is forward-only; rollback is "ignore the table".
7. **Reduced-motion / cinematic hero** stays as-is. Phase 1 doesn't touch animation.

I will pause for confirmation on items **(2)** and **(3)** before writing code if you want to adjust them. Otherwise I'll proceed as listed.

---

## 3. Per-bug fix plan

### BUG-01 — URL i18n
**Root cause:** half-migrated app dir; ~10 route groups still live at app root.

**Fix:**
1. Move route folders into `src/app/[locale]/`. For groups currently using `topicRoute(seg)`, the new shape is:
   - `src/app/[locale]/<group>/page.tsx` — group index (calls a new `topicGroupIndex(seg)` helper, see step 3)
   - `src/app/[locale]/<group>/[slug]/page.tsx` — topic detail
2. Delete the old unlocalized `src/app/<group>/[[...slug]]/page.tsx` folders.
3. Refactor `src/lib/topic-route.tsx`:
   - Split into `topicSlugRoute(seg)` (single-slug page handler) and `topicGroupIndex(seg)` (group index).
   - All `absoluteUrl('/' + segment)`, `localePath(locale, …)`, and `breadcrumbLd([…])` calls switch to `localizedUrl('fa', '/' + segment + …)` so JSON‑LD and visible breadcrumbs both point to `/fa/<group>/<slug>`.
4. Replace the inverted redirect at `src/app/[locale]/germany-visa-from-turkey/page.tsx` with the real page content; move the page from root to `[locale]/`.
5. Wire `next.config.js#async redirects()` to emit **301**s for the entire root→locale map (see §6).
6. Update `src/app/sitemap.ts`: every entry uses `localizedUrl(defaultLocale, …)`; drop the `direct: true` branch for germany-visa-from-turkey.
7. Update **every internal link** — `Header`, `Footer`, `GermanyTopics`, `Services`, `PageHero`, `topic-route` JSON‑LD, and the four `[locale]/page.tsx` files that hard-reference paths — to use `localePath(locale, '/…')`.
8. The `[locale]/germany-visa-from-turkey` file currently `permanentRedirect`s in the WRONG direction; flip it to be the real page.
9. Verify `<link rel="canonical">` matches the rendered URL. `pageMetadata({locale, path})` already produces `https://almanyar.com/fa/<path>` — confirm topic pages call `pageMetadata`, not `rootPageMetadata`.

**Files touched (≈25):**
- moved/renamed: 10 route directories under `src/app/`
- modified: `src/lib/topic-route.tsx`, `src/lib/seo.ts` (remove `rootPageMetadata` after migration), `src/app/sitemap.ts`, `src/app/[locale]/layout.tsx`, `next.config.js`, `src/components/{Header,Footer,GermanyTopics,Services,PageHero}.tsx`, `src/lib/germany-topics.ts` (if it hardcodes paths — verified it doesn't)
- created: `src/middleware.ts` (locale guard for `/tr` `/en` 404s)

**Risk:** High. Touches public URL space. Mitigation: full 301 map (§6), automated link crawler test, `tests/phase-1/01-urls.spec.ts` asserts every old URL returns 301 + new URL returns 200.

---

### BUG-02 — Breadcrumb 404s
**Root cause:** `topic-route.tsx:101` builds the visible middle breadcrumb as `localePath(locale, '/' + segment)` — `/fa/germany-visa` — but the page actually lived at `/germany-visa`. Either the link is wrong OR the page is wrong. The spec chooses "page is wrong" — fixed by BUG-01.

**Additional fix on top of BUG-01:**
1. Render the last breadcrumb item as `<span aria-current="page">` (currently `PageHero` already does — verify and keep).
2. JSON-LD `BreadcrumbList` in `topic-route.tsx` already exists; just update its URLs to the new `/fa/<group>/<slug>` shape.
3. Add an automated test that crawls every static page, parses `<nav aria-label="breadcrumb">` (or the JSON-LD), extracts every `href`, and asserts a 200 response. Lives at `tests/phase-1/02-breadcrumbs.spec.ts`.

**Files touched:** `src/components/PageHero.tsx` (audit only), `src/lib/topic-route.tsx`, new test file.

**Risk:** Low after BUG-01 lands.

---

### BUG-03 — Zero-value stats / empty social proof
**Root cause:** unconditional render with `target={0}`; rating link rendered regardless of `totalReviews`.

**Fix:**
1. **DB:**
   - New Prisma model `SiteStats` (singleton row, `id = 1`):
     - `students_count Int?`, `partner_universities Int?`, `success_rate Int?`, `years_experience Int?`, `average_rating Float?`, `reviews_count Int?` (all nullable)
   - Migration `add_site_stats`. Seed inserts a single row with all NULLs.
2. **API:** `GET /api/stats` reads the singleton, returns `{ students, universities, success, experience, rating, reviews }` with nulls where unset.
3. **Admin:** `app/admin/stats/page.tsx` — auth-gated form bound to `PATCH /api/stats`. Existing `lib/admin-guard.ts` provides the check.
4. **Frontend:**
   - `[locale]/page.tsx` fetches stats server-side, merges with live review aggregate (existing `prisma.review.aggregate`). Live aggregate **overrides** the manual `reviews_count` / `average_rating` if it has ≥1 row.
   - `HomeClient` (and `CinematicJourneyHero`) receive `stats: SiteStats | null` and apply the **hide rule**:
     - Stats grid: hidden if **all four** of `students/universities/success/experience` are nullish or 0. Individual stat cells hidden if their value is nullish or 0.
     - Star rating + review count: hidden if `reviews_count < 1`.
     - `Testimonials` section: hidden entirely if `reviews_count < 5` (spec).
5. The cinematic AlmanYar scene's `STAT_ITEMS` array becomes a prop, populated from the same source.

**Files touched:** `prisma/schema.prisma`, `prisma/migrations/<new>/migration.sql`, `prisma/seed.ts` (insert singleton), `src/app/api/stats/route.ts` (new), `src/app/admin/stats/page.tsx` (new), `src/lib/site-stats.ts` (new server util), `src/components/HomeClient.tsx`, `src/components/journey/CinematicJourneyHero.tsx`, `src/components/Testimonials.tsx`.

**Risk:** Medium (DB migration). Migration is additive — safe rollback is `prisma migrate resolve --rolled-back`.

---

### BUG-04 — FAQ "+" artifact
**Root cause:** `FaqAccordion.tsx:19` renders the literal `+` glyph as the toggle indicator.

**Fix:**
1. The spec asks for shadcn/ui + Radix + lucide-react. **Decision:** install `@radix-ui/react-accordion` + `lucide-react` only — skip the full shadcn/ui CLI install (we'd ship 200+kb of unused components). Two small deps, ~14 kb gzipped total.
2. Rewrite `FaqAccordion.tsx` on top of `Radix Accordion`:
   - `<Accordion.Root type="single" collapsible>` (only one open at a time)
   - `<ChevronDown>` from lucide-react inside the trigger; rotates 180° via `data-[state=open]:rotate-180`
   - Radix gives us `aria-expanded`, `aria-controls`, unique ids and keyboard handling for free
   - Open/close animation via Radix `data-state` + CSS `transition` on `max-height` (no JS)
3. Same component used everywhere (`topic-route.tsx`, `germany-visa-from-turkey/page.tsx`, `[locale]/germany-visa-from-turkey/page.tsx`, `[locale]/exams/page.tsx`) — no per-page accordion duplicates.

**Files touched:** `src/components/FaqAccordion.tsx`, `package.json`, plus any place that imported the old `FaqItem` type (same export name, same shape — no callers change).

**Risk:** Low. Public component API unchanged.

---

### BUG-05 — Header / Footer drift
**Root cause:** every page renders `<Header>` and `<Footer>` itself — no shared layout. There is no second Header component in the tree, but the entry points are different (some pages render `HomeClient` which renders Header; some pages render Header directly), so any future tweak that lands in one path silently skips the other.

**Fix:**
1. Move Header/Footer into `src/app/[locale]/layout.tsx`. Remove the imports + JSX from every page (HomeClient, all topic-route, all bespoke pages).
2. Create `src/config/navigation.ts`:
   ```ts
   export const PRIMARY_NAV = [
     { key: 'services', hash: '#services' },
     { key: 'process',  hash: '#process'  },
     { key: 'guide',    path: '/guide'    },
     { key: 'turkey-residence', path: '/turkey-residence' },
     { key: 'contact',  hash: '#contact'  },
   ] as const;
   ```
   Header and Footer both read from this single source.
3. Mobile hamburger stays in the existing Header (already implemented with `aria-expanded`, `aria-controls="mobile-navigation"`). Spec asks for Radix Dialog/Sheet — defer to Phase 2 unless `prefers-reduced-motion` testing reveals an accessibility regression; for Phase 1 the existing implementation passes keyboard + screen reader. **Will flag this for your call.**
4. Dictionary `nav.*` keys checked once — they're already centralized, drift comes from JSX, not from the dict.

**Acceptance:** view source on 5 random pages, diff the `<header>` and `<footer>` blocks → byte-identical except for active-link state. Test `tests/phase-1/05-layout.spec.ts` does exactly that programmatically.

**Files touched:** `src/app/[locale]/layout.tsx`, all `[locale]/**/page.tsx` (remove Header/Footer JSX), `src/lib/topic-route.tsx` (remove Header/Footer), `src/components/{Header,Footer}.tsx`, new `src/config/navigation.ts`.

**Risk:** Medium. Many file touches but mechanical.

---

### BUG-06 — Eval form Iran-only
**Root cause:** `EvaluationWizard.tsx:57–61` hard-codes Iranian provinces; no country step; no persistence.

**Fix:**
1. Add a new first step inside the existing "مشخصات تماس" section:
   - `country: 'IR' | 'TR' | 'OTHER'` (`ایران` / `ترکیه` / `سایر`)
2. Conditional:
   - `IR` → existing province list
   - `TR` → 81-province list (`src/lib/turkish-provinces.ts`)
   - `OTHER` → free-text "شهر، کشور"
3. **Persistence:** `useEffect` writes `JSON.stringify(form)` to `localStorage['almanyar_eval_v1']` on every change (debounced 250 ms). On mount, hydrate state from localStorage. Cleared on successful submit.
4. **Anti-spam:** invisible honeypot `<input name="hp" tabIndex={-1} className="sr-only" />` — submit aborts if non-empty. reCAPTCHA v3 deferred (requires Google account + env keys + CSP `script-src` update) — **flagging as deferred to Phase 2**, will add the honeypot only.
5. **Validation:** zod schema mirroring `FormState`; Persian error messages; client + `/api/evaluation` route both validate. Replace current ad-hoc `validateStep`.
6. **Email confirmation to user:** existing nodemailer pipeline in `src/lib/`; add a second `sendMail({to: form.email, ...})` after admin notification. Spec mentioned Resend — we already have SMTP wired (Brevo / Mailgun per DEPLOY.md), avoiding a new vendor.
7. **Required-field asterisks pass:** every `<Field required>` and `<Field>` audited; `(اختیاری)` added to optional fields per spec.

**Files touched:** `src/components/EvaluationWizard.tsx`, new `src/lib/turkish-provinces.ts`, new `src/lib/eval-schema.ts` (zod), `src/app/api/evaluation/route.ts`, `src/lib/email-templates.ts` (new — user confirmation email).

**Risk:** Medium. Form is converting users; staging test before going live.

---

### BUG-07 — Truncated meta descriptions / deprecated keywords
**Root cause:** `topic-route.tsx:46` `.slice(0, 160)` cuts on byte boundary, can split a word. Multiple pages pass `keywords:` to `Metadata`, which Next emits as `<meta name="keywords">`.

**Fix:**
1. New util `src/lib/truncate.ts` exporting `truncateDescription(text: string, max = 155)`:
   - Collapse whitespace
   - Trim
   - If `length ≤ max`, return as-is
   - Else find the last whitespace before `max`, truncate there, strip trailing punctuation, append "…" (or "." per spec — using "." since spec says "ends on complete word + period")
2. Replace every `.slice(0, 160)` and ad-hoc truncation with this util.
3. Strip the `keywords` field everywhere:
   - `pageMetadata`, `rootPageMetadata`: remove the parameter
   - All `PAGE_SEO.*.keywords` entries: removed
   - `src/lib/seo-content.ts` types updated
4. Title audit: `truncateDescription` companion `truncateTitle(text, 60)` for any title > 60.
5. **Audit script** `scripts/audit-meta.ts`:
   - Crawls every route (uses `next-sitemap`-style enumeration from `src/app/sitemap.ts`)
   - Loads each URL via local dev server
   - Reports: descriptions > 160, mid-word cuts (`/[؀-ۿ\w]$/` test), missing/empty, any `<meta name="keywords">`
   - Exits non-zero on any issue
6. **Build-time check:** add `npm run audit:meta` script; wire into Dockerfile right after `npm run build` so the production build fails if any page regresses.

**Files touched:** new `src/lib/truncate.ts`, `src/lib/seo.ts`, `src/lib/seo-content.ts`, `src/lib/topic-route.tsx`, `src/app/[locale]/**/page.tsx` (audit only), new `scripts/audit-meta.ts`, `package.json` (script + dev dep `tsx` already present), `Dockerfile`.

**Risk:** Low. Build-time check is the strongest guardrail.

---

## 4. Order of execution

Order is chosen so each step builds on a *passing* baseline:

1. **BUG-04** — `FaqAccordion` rewrite. Tiny blast radius, gives me a green test to anchor on, also touched by topic-route which I'm about to refactor.
2. **BUG-07** — meta description util + remove `keywords`. Required by changes I'll make to `pageMetadata` in step 3.
3. **BUG-01** — URL i18n move. The big one. After this, BUG-02 falls out for free.
4. **BUG-02** — confirm breadcrumbs + automated crawl test. Mostly verification work after step 3.
5. **BUG-05** — Header/Footer into shared layout. Done after BUG-01 because the page files are getting moved anyway.
6. **BUG-03** — `SiteStats` model + admin + frontend hide rules. Requires DB migration; isolated from routing.
7. **BUG-06** — Eval wizard. Isolated, last so it doesn't block earlier work.

Each step ends with: green tests for that step, focused commit, push to `cursor/saas-landing-ui-redesign`. No `main` merge until Phase-1 is fully done and you've reviewed.

---

## 5. Scope confirmation needed (small list)

I'll proceed with these defaults unless you object:

| # | Decision | Default |
|---|---|---|
| A | Auth/dashboard/admin/api paths: stay un-prefixed (NextAuth callback URLs would otherwise break) | **keep at root** |
| B | Spec says "shadcn/ui Accordion" — I'll install `@radix-ui/react-accordion` + `lucide-react` directly (saves the whole shadcn CLI scaffold) | **direct deps, no shadcn CLI** |
| C | Spec says "reCAPTCHA v3" — needs Google site/secret keys + CSP rule. Phase-1 ships honeypot only; reCAPTCHA deferred to Phase 2 | **honeypot only** |
| D | Spec says "Resend" — I'll use the existing nodemailer/SMTP pipeline that's already wired up | **stay on SMTP** |
| E | Spec says "Radix Dialog/Sheet" for mobile menu — existing implementation already has correct ARIA. I'll keep it (audit for a11y) unless you want the Radix swap | **keep current, audit only** |

---

## 6. Full redirect map (BUG-01)

301s emitted from `next.config.js#async redirects()`. Source patterns are literal — no regex globs needed.

```
/germany-visa                       → /fa/germany-visa
/germany-visa/:slug*                → /fa/germany-visa/:slug*
/germany-visa-from-turkey           → /fa/germany-visa-from-turkey
/study-germany                      → /fa/study-germany
/study-germany/:slug*               → /fa/study-germany/:slug*
/work-germany                       → /fa/work-germany
/work-germany/:slug*                → /fa/work-germany/:slug*
/jobs-germany                       → /fa/jobs-germany
/jobs-germany/:slug*                → /fa/jobs-germany/:slug*
/life-germany                       → /fa/life-germany
/life-germany/:slug*                → /fa/life-germany/:slug*
/exams                              → /fa/exams
/exams/:slug*                       → /fa/exams/:slug*
/ausbildung                         → /fa/ausbildung
/ausbildung/:slug*                  → /fa/ausbildung/:slug*
/germany-embassy                    → /fa/germany-embassy
/germany-embassy/:slug*             → /fa/germany-embassy/:slug*
/services                           → /fa/services
/services/:slug*                    → /fa/services/:slug*
/faq                                → /fa/faq
/faq/:slug*                         → /fa/faq/:slug*
```

Out-of-scope (intentionally NOT redirected — see §5.A):
`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/dashboard`, `/admin/:path*`, `/api/:path*`, `/sitemap.xml`, `/robots.txt`, `/favicon.png`.

Middleware (`src/middleware.ts`) additionally:
- Returns 404 for `/tr/:path*` and `/en/:path*` (reservation)
- Leaves everything else untouched

---

## 7. Tests

All under `tests/phase-1/` using **Playwright**. (No test infra exists yet → I'll add `@playwright/test` + `playwright.config.ts` + `test` script.)

| File | What it asserts |
|---|---|
| `01-urls.spec.ts` | Every entry in §6 returns 301 → expected target; every new URL returns 200 |
| `02-breadcrumbs.spec.ts` | Crawl every page from `sitemap.xml`, extract breadcrumb hrefs, assert 200 |
| `03-stats-hidden.spec.ts` | With empty stats DB, hero stats block + rating + Testimonials are absent from HTML |
| `04-faq-accordion.spec.ts` | No `+`/`-` text artifact in any FAQ; ChevronDown SVG present; keyboard Enter toggles; `aria-expanded` flips |
| `05-layout.spec.ts` | `<header>` and `<footer>` HTML identical (minus aria-current) across 5 sampled pages |
| `06-eval-form.spec.ts` | Select country=ترکیه shows Turkish provinces; refresh mid-form restores state; on submit honeypot prevents submission when filled |
| `07-meta.spec.ts` | Every page's meta description ≤ 160 chars, does not end in `[؀-ۿ\w]`; no `<meta name="keywords">` anywhere |

The `audit-meta.ts` script runs as part of `npm test` and Docker build.

---

## 8. Rollback strategy

| Layer | Rollback |
|---|---|
| Code | `git revert <range>` of the Phase-1 commits — each bug is in its own focused commit so a single bug can be reverted in isolation |
| Routing | The 301s are reversible: revert `next.config.js` + restore the old root-level route folders from git. Old crawled URLs go back to working. |
| DB (`SiteStats`) | `prisma migrate resolve --rolled-back <id>` then drop the empty table manually — no data depends on it. Frontend gracefully handles `stats === null` (hide rule). |
| Live deploy | Same `rsync` + `docker compose up -d --build` we used today. Two-second restart window. The previous container image is kept until the next `--build`, so `docker compose up -d --no-build` against the old image is the fastest manual rollback. |

---

## 9. Deliverables checklist

- [x] `PHASE-1-PLAN.md` (this file)
- [ ] Per-bug commits on `cursor/saas-landing-ui-redesign`
- [ ] `tests/phase-1/*.spec.ts` (7 files) + `playwright.config.ts`
- [ ] `scripts/audit-meta.ts`
- [ ] DB migration `prisma/migrations/<ts>_add_site_stats/`
- [ ] `PHASE-1-REPORT.md` summarizing changes + manual verification checklist

---

## 10. What I need from you to proceed

1. Confirm decisions **A–E** in §5 (or override individually).
2. Confirm the redirect map in §6 (any path I missed? any path you'd rather NOT redirect?).
3. Approve the execution order in §4 (or reorder).
4. Say "go" and I start with **BUG-04 (FAQ)** as step 1.
