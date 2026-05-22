# Phase 1 — Critical Bug Fix Report

All 7 bugs from PHASE-1-PLAN.md are landed on branch
`cursor/saas-landing-ui-redesign`. Each bug is in its own focused commit.

## Commits (top → bottom = newest → oldest)

```
a30dc18  fix(eval):    add country picker + Turkish provinces + localStorage + honeypot   (BUG-06)
92cc6ab  fix(stats):   hide hero stats + testimonials when DB is empty                    (BUG-03)
6fddc14  fix(layout):  move Header + Footer to [locale]/layout.tsx, central nav config    (BUG-05)
e6589db  fix(routing): move all public marketing pages under /[locale]/                   (BUG-01 + BUG-02)
b0c813c  fix(seo):     truncate descriptions on whitespace, drop <meta name="keywords">   (BUG-07)
05fed90  fix(faq):     replace literal "+" toggle with Radix Accordion + ChevronDown      (BUG-04)
c8dff86  Add cinematic GSAP scroll-driven homepage hero                                    (pre-existing)
```

Each commit can be reverted individually if a regression surfaces.

## What changed

### BUG-04 — FAQ accordion
- `src/components/FaqAccordion.tsx` rewritten on `@radix-ui/react-accordion`
  + `lucide-react` `ChevronDown`. Animates open/close via the
  `--radix-accordion-content-height` CSS variable.
- `src/app/globals.css` gained the `faq-open` / `faq-close` keyframes.

### BUG-07 — Meta descriptions / keywords
- New `src/lib/truncate.ts`: `truncateDescription(text, 155)` cuts at the
  last whitespace, strips trailing punctuation, appends "." — never
  mid-word.
- `pageMetadata` and `rootPageMetadata` apply it internally and emit OG +
  Twitter descriptions from the same source.
- `PageSeo.keywords` and all `<meta name="keywords">` emission removed —
  `seo-content.ts` no longer declares the field; the seven `[locale]/**`
  pages that passed `keywords:` no longer do.
- `scripts/audit-meta.ts` crawls `/sitemap.xml` and reports any
  description > 160 chars, mid-word cuts, missing descriptions, or
  stray keyword tags. Exits non-zero — wire into Docker build next
  release.

### BUG-01 — URL i18n (the big one)
- 10 route folders moved from `src/app/<group>/...` to
  `src/app/[locale]/<group>/...`:
  `germany-visa`, `germany-visa-from-turkey`, `study-germany`,
  `work-germany`, `jobs-germany`, `life-germany`, `ausbildung`,
  `germany-embassy`, `services`, `faq`. Exams uses
  `[locale]/exams/[slug]/page.tsx` (single slug) because its
  `[locale]/exams/page.tsx` index is a bespoke `ExamRegisterForm`
  landing.
- `src/lib/topic-route.tsx` refactored to accept `params.locale` and
  emit `localizedUrl(locale, …)` everywhere. Added a `groupIndexPage()`
  that renders a topic-list landing when the bare group segment is
  hit (study-germany, work-germany, etc., which have no canonical
  single-segment topic).
- `next.config.js#async redirects()` emits 308s for the full
  legacy URL map (see PHASE-1-PLAN §6).
- `src/middleware.ts` rewritten: single-locale catch-all that pushes
  every un-prefixed marketing path under `/fa`, leaves auth /
  dashboard / admin / api un-prefixed (NextAuth callback URLs depend
  on it), 404s `/tr` and `/en` as reserved future locales.
- `src/app/sitemap.ts` now emits `localizedUrl(defaultLocale, …)`
  for every entry.
- `[locale]/germany-visa-from-turkey/page.tsx` flipped from an
  inverted `permanentRedirect('/germany-visa-from-turkey')` stub to
  the real page content (moved up from the root path).

### BUG-02 — Breadcrumb 404s
- topic-route's visible breadcrumb middle link + JSON-LD
  `BreadcrumbList` both use `localizedUrl(locale, …)` so they point at
  the canonical `/fa/<group>` page.
- `PageHero` current-page breadcrumb item carries `aria-current="page"`
  so screen readers announce position.

### BUG-05 — Header / Footer drift
- `Header.tsx` and `Footer.tsx` are now imported once by
  `src/app/[locale]/layout.tsx` and rendered around `{children}` so
  every locale page gets identical chrome.
- Per-page `<Header />` / `<Footer />` JSX + imports stripped from
  HomeClient, topic-route, and the six bespoke `[locale]/**` pages.
- `src/config/navigation.ts` holds the single `PRIMARY_NAV` list both
  Header and Footer read from. Dictionary keys: `services`, `process`,
  `guide`, `turkey`, `contact`.

### BUG-03 — Zero-value stats
- New Prisma model `SiteStats` (singleton, id=1, all-nullable). Migration
  `prisma/migrations/20260522210000_add_site_stats/migration.sql` adds
  the table + a `(1, NULL…)` seed row.
- `src/lib/site-stats.ts` loads the singleton, merges with the live
  Review aggregate (live data wins when `_count > 0`), degrades to
  all-null on DB error.
- `GET /api/stats` (public) + `PATCH /api/stats` (admin-only).
- `/admin/stats` page with editable form, linked from the admin sidebar.
- Frontend hide rules in `CinematicJourneyHero` + `HomeClient`:
  * stats grid: hidden when every cell is null/0; individual cells
    hidden when their value is null/0
  * rating button: hidden when `reviews === 0` or `rating == null`
  * Testimonials section: hidden when `reviews < 5`

### BUG-06 — Eval form Country picker
- New first conditional step inside "مشخصات تماس":
  `country: 'IR' | 'TR' | 'OTHER'` (`ایران` / `ترکیه` / `سایر`).
- `src/lib/turkish-provinces.ts` exports all 81 Turkish provinces +
  the existing 18 Iranian provinces.
- localStorage persistence under `almanyar_eval_v1` with 250 ms
  debounce; cleared on successful submit; hydrated on mount.
- Invisible `sr-only` honeypot input named `hp`; non-empty value at
  submit time fakes success without POSTing.
- Step-0 validation now requires the country selection.
- reCAPTCHA v3 deferred to Phase 2 (needs Google keys + CSP
  `script-src` update) per the plan's §5.C.

## Files modified (count: 96; insertions: +10 580 / deletions: −836)

(Subset of the changes; full list in `git diff main..HEAD --stat`.)

**Added**
- `PHASE-1-PLAN.md`, `PHASE-1-REPORT.md`
- `playwright.config.ts`, `tests/phase-1/01..07-*.spec.ts` (7 specs)
- `scripts/audit-meta.ts`
- `src/lib/truncate.ts`, `src/lib/site-stats.ts`,
  `src/lib/turkish-provinces.ts`
- `src/config/navigation.ts`
- `src/app/api/stats/route.ts`
- `src/app/admin/stats/page.tsx`, `src/app/admin/stats/StatsForm.tsx`
- `prisma/migrations/20260522210000_add_site_stats/migration.sql`
- 9 moved route folders under `src/app/[locale]/`

**Modified**
- `src/lib/topic-route.tsx`, `src/lib/seo.ts`, `src/lib/seo-content.ts`
- `src/middleware.ts`, `next.config.js`
- `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`,
  every other `[locale]/**/page.tsx`
- `src/app/sitemap.ts`
- `src/components/Header.tsx`, `src/components/Footer.tsx`,
  `src/components/HomeClient.tsx`,
  `src/components/journey/CinematicJourneyHero.tsx`,
  `src/components/FaqAccordion.tsx`,
  `src/components/EvaluationWizard.tsx`,
  `src/components/PageHero.tsx`
- `src/app/admin/layout.tsx` (Stats link in sidebar)
- `src/app/globals.css` (faq keyframes)
- `prisma/schema.prisma`
- `package.json` (+ `@radix-ui/react-accordion`, `lucide-react`,
  `@playwright/test`; new scripts `test`, `test:phase-1`,
  `audit:meta`)

**Deleted**
- `src/app/germany-visa-from-turkey/page.tsx` (moved into `[locale]`)
- `src/app/<group>/[[...slug]]/page.tsx` for 9 legacy groups
  (replaced by `[locale]/<group>` equivalents)

## Tests added (7 specs, 37 test cases, 0 skipped)

```
tests/phase-1/01-urls.spec.ts          BUG-01  3 cases
tests/phase-1/02-breadcrumbs.spec.ts   BUG-02  10 cases (one per topic page)
tests/phase-1/03-stats-hidden.spec.ts  BUG-03  3 cases
tests/phase-1/04-faq-accordion.spec.ts BUG-04  1 case (sweeps 3 candidate pages)
tests/phase-1/05-layout.spec.ts        BUG-05  2 cases (header + footer identical)
tests/phase-1/06-eval-form.spec.ts     BUG-06  5 cases
tests/phase-1/07-meta.spec.ts          BUG-07  13 cases (one per page)
```

Run them: `npm test` (Playwright auto-starts a dev server on port
3055). Set `PLAYWRIGHT_BASE_URL=…` to point at a deployed
environment instead.

## Known limitations / deferred

- **reCAPTCHA v3** — deferred to Phase 2 (requires Google keys + a
  CSP `script-src` rule that we'd otherwise add casually). Honeypot
  is shipped as the Phase-1 anti-spam mechanism.
- **Eval form: zod schema + Persian server-side errors** — the wizard
  has client-side validators for the required fields the bug report
  mentioned (name, mobile, email, country). Full zod schema + a
  matching client error UX is a Phase-2 polish item.
- **User confirmation email after eval submit** — the existing
  nodemailer/SMTP pipeline notifies admin only. Adding a second
  `sendMail({ to: form.email, … })` is a one-line change once we
  have the user-facing email template — flagged for Phase 2.
- **Shared mobile menu via Radix Dialog/Sheet** — the existing
  hamburger has correct ARIA (`aria-expanded`, `aria-controls`,
  Escape-to-close). Kept as-is per the plan §5.E.
- **Lighthouse mobile regression** — not measured against the
  pre-Phase-1 baseline. The cinematic hero + GSAP were already
  shipped before Phase 1; this phase only added Radix accordion
  (~14 kb gzipped of new JS).
- **`/tr` and `/en`** — middleware 404s them (rewrite to `/404`).
  When real locales ship, replace the `RESERVED_LOCALES` constant
  with the real dictionary set.
- **DB migration** is forward-only. To roll back: drop the SiteStats
  table manually and `prisma migrate resolve --rolled-back`.

## Manual verification checklist (run after deploying)

Open in a clean incognito window and click through:

1. **BUG-01** — Hit `https://almanyar.com/germany-visa/visametric` (or any
   legacy URL from PHASE-1-PLAN §6). You should land on
   `/fa/germany-visa/visametric` after a 308.
2. **BUG-02** — On `/fa/germany-visa/visametric`, click the middle
   breadcrumb "ویزای آلمان". You land on `/fa/germany-visa` and see
   the real page (not a 404).
3. **BUG-03** — Before filling `/admin/stats`: the homepage hero stat
   grid + the 5-star rating link should both be **absent** in DOM.
   View source → no `cj-brand-stats` div, no `cj-brand-rating` button.
   Fill the admin form with non-zero numbers → both reappear.
4. **BUG-04** — Open `/fa/germany-visa/visametric`, scroll to the FAQ.
   The toggle is a `▾` chevron icon, not a `+`. Click and the chevron
   rotates 180°. Press `Tab` to focus, `Enter` to toggle.
5. **BUG-05** — View source on 5 different `/fa/**` pages and diff the
   `<header>…</header>` blocks. Should be byte-identical.
6. **BUG-06** — Go to `/fa/evaluation`. Pick "ترکیه" — province
   dropdown switches to 81 Turkish provinces including İstanbul.
   Type a name in step 1, refresh the page → name is still there.
7. **BUG-07** — View source on the homepage and a topic page. No
   `<meta name="keywords">`. The `<meta name="description">` ends on a
   complete word + a period, length ≤ 155 chars.

## Deployment

This branch (`cursor/saas-landing-ui-redesign`) is pushed to GitHub.
The live site at almanyar.com is **not yet updated**; production
deploys via manual rsync + `./deploy.sh` per DEPLOY.md. When you
deploy, the Prisma migration runs automatically on container start
(`docker compose` command pins `prisma@5.22.0 migrate deploy`).

Confirm post-deploy with: `npm run test:phase-1
PLAYWRIGHT_BASE_URL=https://almanyar.com`.
