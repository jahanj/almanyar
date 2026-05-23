# Phase 3 — Trust & Authority Report

All 11 TRUST tasks landed on branch `cursor/saas-landing-ui-redesign`.
**11 focused commits** since Phase 2 ended; each one reverts cleanly.

> **Test execution status:** spec files for every task are written and
> committed. **No Playwright runs were executed in this session** per
> your mid-phase directive (Playwright runs cost a Next dev-server
> boot + full Chromium drive each, and the runs were interrupting flow).
> Type-check (`tsc --noEmit`) ran clean after every commit. Full Phase
> 1 + 2 + 3 batch run is **gated on your approval** at the end of this
> report.

---

## Commits (newest → oldest, Phase-3 only)

```
5d2df61  feat(trust):   germany-risk consent — 2nd checkbox + DB columns + API gate     (TRUST-10)
0d27d49  content(hiw):  Germany-route honesty callout under step 4                       (TRUST-09)
0aa8daa  feat(trust):   floating WhatsApp CTA on every public marketing page             (TRUST-08)
717fd75  feat(trust):   footer contact column — email, WhatsApp, city                    (TRUST-03)
b569406  content(hero): sharpen Iran-scene caption to embassy-driven positioning         (TRUST-07)
e4a7284  feat(trust):   rewrite TrustModel as 3 spec'd cards w/ link to /about           (TRUST-06)
7b15562  feat(trust):   seed real stats — studentsCount=20, yearsExperience=6            (TRUST-05)
2b83782  feat(trust):   Person LD = محمد جهانبانی, Medipol affiliation, sameAs=[]        (TRUST-04)
4b141f8  feat(trust):   /fa/about — owner bio + four-section trust narrative             (TRUST-01)
956f78a  feat(trust):   owner photo placeholder + OWNER_PHOTO_URL constant               (TRUST-02)
5fb7f60  content(pos):  rewrite "کارشناسان ما" to single-consultant voice                (TRUST-11)
```

Each commit is self-contained — `git revert <sha>` rolls back one task
without touching another.

---

## What changed — per task

### TRUST-11 — single-consultant audit (6 rewrites)
| File:Line | Original | Replacement | Reason |
|---|---|---|---|
| `src/app/[locale]/guide/page.tsx:263` | "**کارشناسان ما** رایگان شرایط شما را بررسی می‌کنند." | "**من** رایگان شرایط شما را بررسی می‌کنم." | Single consultant |
| `src/app/[locale]/turkey-costs/page.tsx:130` | "…با **کارشناسان ما** در تماس باشید." | "…با **ما** در تماس باشید." | Single consultant |
| `src/app/[locale]/turkey-residence/page.tsx:194` | "**کارشناسان ما** در تمام مراحل … همراه شما هستند." | "**ما** در تمام مراحل … همراه شما هستیم." | Single consultant |
| `src/app/[locale]/exams/page.tsx:143` | "**کارشناسان ما** تماس می‌گیرند…" | "**ما** تماس می‌گیریم…" | Single consultant |
| `src/components/EvaluationWizard.tsx:212` | "**کارشناسان ما** شرایط شما را با دقت بررسی می‌کنند…" | "**من** شرایط شما را با دقت بررسی می‌کنم…" | Single consultant |
| `src/components/ContactForm.tsx:228` | "**کارشناسان ما** به‌زودی … تماس می‌گیرند." | "**ما** به‌زودی … تماس می‌گیریم." | Single consultant |
| `*` | "تیم ما" / "شرکت ما" / "متخصصان ما" | (none found) | Phase-2 POSITIONING-03 already cleaned the only "تیم ما"; never used "شرکت ما"/"متخصصان ما" as self-references |

Test `tests/phase-3/11-team-audit.spec.ts` enforces zero new occurrences. Same allow-list shape as the Phase-2 guarantee audit so a future reviewer can intentionally keep an occurrence with a written reason.

### TRUST-02 — Photo placeholder + `OWNER_PHOTO_URL` constant
- `public/team/mohammad-jahanbani-placeholder.svg` — 800×800 silhouette in brand emerald, with a small "placeholder" wordmark in the corner so it can't be mistaken for the final image during marketing.
- `src/lib/owner.ts` — single source of truth: `OWNER_PHOTO_URL`, `OWNER_PHOTO_WIDTH/HEIGHT`, plus `OWNER` constants (`fullName`, `brand`, `jobTitle`, `university`, `universityUrl`, `yearsInTurkey`).

### TRUST-01 — `/fa/about`
- `src/app/[locale]/about/page.tsx` — owner bio + four sections (intro / why / services / principles) + final CTAs.
- `src/lib/owner-content.ts` — typed content store, spec wording verbatim.
- `src/config/contact.ts` — centralized `WHATSAPP_URL` (with Persian prefilled message), `CONTACT_EMAIL`, `OFFICE_CITY_FA`. Footer + floating button + about-page CTAs all consume this.
- Registered in `site-routes.ts` → appears in `sitemap.xml`.
- Added "درباره ما" to `PRIMARY_NAV` between "نحوه کار ما" and "خدمات ما"; dict.nav.about across fa/tr/de.

### TRUST-04 — Person LD identity update
`src/lib/seo.ts → personLd()` now returns:
- `name: 'محمد جهانبانی'`, `alternateName: 'آلمانیار'`
- `image: absoluteUrl(OWNER_PHOTO_URL)` — placeholder today
- `affiliation: { @type: 'EducationalOrganization', name: 'İstanbul Medipol Üniversitesi', url: 'https://www.medipol.edu.tr' }`
- `contactPoint.availableLanguage: ['fa', 'tr']` — narrower than `knowsLanguage` which still has all four (per §5.C ack)
- `sameAs: []` — dropped the IG + Telegram placeholders (no live channels)

### TRUST-05 — Real stats seed
`prisma/migrations/20260523_seed_real_stats/migration.sql`:
```sql
UPDATE "SiteStats"
SET "studentsCount"   = COALESCE("studentsCount",   20),
    "yearsExperience" = COALESCE("yearsExperience", 6)
WHERE "id" = 1;
```
Idempotent (uses COALESCE so future `/admin/stats` edits win). Only the two visible columns are touched — partner-universities / success-rate / reviews / rating stay NULL → the BUG-03 hide rule keeps their cards off the page.

### TRUST-06 — Homepage `TrustModel` → 3 cards
`src/components/TrustModel.tsx` rewritten:
- Card 1: 🇹🇷 ترکیه به‌عنوان پل آماده‌سازی
- Card 2: 🔓 پذیرش دانشگاه ترکیه — کاملاً رایگان
- Card 3: 🤝 ۶ سال تجربه واقعی در ترکیه
- Onward CTA → `/fa/about` (was `/fa/how-it-works` in Phase 2)

Phase-2 test `tests/phase-2/13-trust-section.spec.ts` softened to assert only "section exists + has an onward CTA to /about OR /how-it-works"; the strict card-shape assertion lives in `tests/phase-3/06-trust-cards.spec.ts`.

### TRUST-07 — Iran-scene caption swap (cinematic preserved)
Per §5.B ack: didn't dismantle the cinematic. Only swapped the Iran scene's caption + the `StaticFallback` mirror.

- title: "هر مسیر بزرگی، از یک تصمیم شروع می‌شود" → "مهاجرت تحصیلی به آلمان از ترکیه"
- subtitle: lyrical → "سفارت آلمان در تهران غیرقابل پیش‌بینی است. مسیر امن از ترکیه شروع می‌شود — ۶ ماه آماده‌سازی، اقامت دانشجویی، سفارت قابل دسترس."
- CTAs live in the new TrustModel block below the hero (clutter-free cinematic).

### TRUST-03 — Footer contact column
- "تماس" column, right side on `md+` / centered on mobile.
- mailto:contact@almanyar.com (verified Cloudflare Email Routing → Gmail per your confirmation).
- wa.me link with Persian prefilled message (same `WHATSAPP_URL` helper).
- "استانبول، ترکیه" (text only, no map link).
- Zero social icons. Test asserts no link to instagram.com / t.me/ / linkedin.com / twitter.com / x.com/ / facebook.com appears anywhere in `<footer>`.

### TRUST-08 — Floating WhatsApp CTA
- `src/components/contact/WhatsAppButton.tsx` — client component, fixed bottom-left (RTL site), brand #25D366, official WhatsApp SVG, scale-1.1 hover.
- Mounted from `[locale]/layout.tsx` AFTER CookieNotice. z-40 (cookie notice is z-50), so first-visit consent isn't covered.
- Hidden when `pathname` starts with `/admin`, `/dashboard`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`. The layout already scopes it to `/fa/*` — the in-component check is belt-and-suspenders.

### TRUST-09 — Germany honesty callout in how-it-works
- New `callout` slot on `HOW_IT_WORKS.steps[3]` (step 4 — "مسیر آلمان") in `src/lib/positioning-content.ts`.
- Renders as an amber-bordered aside under step 4 body. Wording from the spec, single paragraph.
- `tests/phase-3/09-germany-honesty.spec.ts` asserts the callout renders with the no-guarantee sentence.

### TRUST-10 — Germany-risk consent (forms + DB + API)
- Schema: `Evaluation` + `ContactRequest` both gain `germanyRiskAcknowledged: Boolean?` and `germanyRiskAcknowledgedAt: DateTime?`. All-nullable; rollback = drop column.
- Migration `prisma/migrations/20260523_add_germany_risk_consent/migration.sql` runs automatically on next container start.
- `src/lib/consent.ts`: `ConsentInputSchema` extended; `consentDbFields()` writes the timestamp; new exported `GERMANY_RISK_LABEL` so the eval form, contact form, and the API rejection message all read the same Persian string.
- API routes `/api/contact` + `/api/evaluation`: reject with HTTP 400 + Persian error if `consent.germanyRiskAcknowledged !== true`.
- UI: amber-bordered required checkbox added to `EvaluationWizard` step 5 and to the final step of `ContactForm`. Visible asterisk; client-side validation surfaces the same Persian error before any POST.

---

## Tests added (`tests/phase-3/` — 9 specs)

```
01-about-page.spec.ts        — bio + photo + WhatsApp CTA + nav link
02-photo-placeholder.spec.ts — placeholder SVG reachable + image content-type
03-footer-contact.spec.ts    — email/WA/city, no social icons
04-person-identity.spec.ts   — Person LD: name+alternateName+affiliation+sameAs=[]
05-stats-seed.spec.ts        — migration SQL shape + idempotence
06-trust-cards.spec.ts       — 3 spec'd cards + CTA to /about
07-hero-copy.spec.ts         — new H1 + embassy subtitle, old caption gone
08-whatsapp-button.spec.ts   — visible on /fa pages, absent on /admin
09-germany-honesty.spec.ts   — callout under step 4
10-germany-risk.spec.ts      — checkbox visible, API gate rejects 400
11-team-audit.spec.ts        — zero "تیم ما"/"شرکت ما"/"کارشناسان ما"/"متخصصان ما"
```

Plus all Phase-1 (37) + Phase-2 (44) tests must continue to pass — **regression run scheduled for your approval below.**

---

## Files modified (summary)

**Added (10)**
- `PHASE-3-PLAN.md`, `PHASE-3-REPORT.md`
- `public/team/mohammad-jahanbani-placeholder.svg`
- `src/lib/owner.ts`, `src/lib/owner-content.ts`
- `src/config/contact.ts`
- `src/app/[locale]/about/page.tsx`
- `src/components/contact/WhatsAppButton.tsx`
- `prisma/migrations/20260523_seed_real_stats/migration.sql`
- `prisma/migrations/20260523_add_germany_risk_consent/migration.sql`
- 9 spec files in `tests/phase-3/`

**Modified (12)**
- `prisma/schema.prisma` (+2 columns × 2 models)
- `src/lib/seo.ts` (`personLd` overhaul; `SITE.social` → `[]`)
- `src/lib/consent.ts` (zod field + `GERMANY_RISK_LABEL`)
- `src/lib/positioning-content.ts` (TRUST-09 callout slot)
- `src/components/Footer.tsx` (contact column)
- `src/components/TrustModel.tsx` (3-card rewrite)
- `src/components/journey/CinematicJourneyHero.tsx` (Iran caption swap + StaticFallback mirror)
- `src/components/ContactForm.tsx` + `src/components/EvaluationWizard.tsx` (germany-risk checkbox + state)
- `src/app/api/contact/route.ts` + `src/app/api/evaluation/route.ts` (API gate)
- `src/app/[locale]/layout.tsx` (WhatsAppButton mount)
- `src/app/[locale]/how-it-works/page.tsx` (callout render)
- `src/config/navigation.ts` + `src/locales/{fa,de,tr}.ts` (nav `about` entry)
- 4 article pages with copy rewrites (guide, turkey-costs, turkey-residence, exams)
- Phase-2 `tests/phase-2/13-trust-section.spec.ts` softened to match Phase-3 reshape

---

## TODO placeholders (owner action required)

| # | Item | Where | Default | Action |
|---|---|---|---|---|
| 1 | **⚠ REPLACE owner photo placeholder before public marketing.** | `public/team/mohammad-jahanbani-placeholder.svg` | Silhouette SVG | (1) Drop real JPG at `public/team/mohammad-jahanbani.jpg`. (2) Edit `OWNER_PHOTO_URL` in `src/lib/owner.ts` to point at the JPG. About page + Person LD update in lockstep. |
| 2 | **`Person.image` → real photo URL** | Same as #1 — `OWNER_PHOTO_URL` cascades into Person LD automatically. | Placeholder | Implicit; ships when #1 ships. |
| 3 | **`Person.sameAs` social URLs** | `src/lib/seo.ts → SITE.social` | `[]` | If you launch real Instagram / Telegram / LinkedIn, append the URLs here. JSON-LD will pick them up; footer will NOT (no icon row by design). |
| 4 | **Real testimonials surface** | Already wired Phase-1 (`/api/reviews` + Testimonials section + `personWithRatingLd` aggregateRating gate at `reviewsCount ≥ 5`) | All hidden today | No code action needed — collect ≥5 approved reviews via `/api/reviews` and the section + the LD rating block appear automatically. |
| 5 | **Partner-universities + success-rate stats** | `/admin/stats` (Phase-1 admin form) | NULL → hidden | When defensible numbers exist, fill via the admin form. Stat cards reappear automatically (Phase-1 BUG-03 hide rule). |
| 6 | **Owner additional photos** | `public/team/` | none | If you provide a study-desk / Istanbul-backdrop / inside-Medipol shot, drop in this folder + I'll add captions on `/fa/about` in a follow-up commit. |
| 7 | **Real `İstanbul Medipol Üniversitesi` page URL on the LD** | `OWNER.universityUrl` in `src/lib/owner.ts` | `https://www.medipol.edu.tr` | Confirm this is the right URL (could be the student-portal / English site / department page if you prefer). |

---

## Audit table: stale "team/company" + guarantee language (Phase-3 sweep)

Cumulative with Phase-2 POSITIONING-03 (`tests/phase-2/14-guarantee-audit.spec.ts`):

| Pattern | Strategy | Findings today |
|---|---|---|
| `تضمین` / `تضمینی` | Allow-list defensive uses; reject promise-shaped ones | 6 allow-listed (negations, FAQ refusal, salary disclaimers, internal author comment). 0 unexpected. |
| `تیم ما` | Block completely | 0 — Phase-2 cleaned the only hit. |
| `شرکت ما` | Block as self-reference (uses of `شرکت` re. German employers are unaffected) | 0 — never appeared as self-reference. |
| `کارشناسان ما` | Block | 6 rewritten this phase, 0 remaining. |
| `متخصصان ما` | Block | 0. |
| `صد در صد موفقیت` / `گارانتی` / `گرنتی` / `تضمین ۱۰۰` | Block (promise-shaped) | 0. |
| `حتماً` / `قطعاً` | KEEP — imperative reader-direction sense ("be sure to verify"), not outcome promises | 14 usages, all imperative ("حتماً منابع رسمی را بررسی کنید"). |

The `حتماً` / `قطعاً` set was reviewed line-by-line during planning (PHASE-3-PLAN context-gathering). All current uses point readers at official sources rather than promising Almanyar outcomes — they're the OPPOSITE of misleading and they stay.

---

## Manual verification checklist (run after deploy)

**Trust / identity**
- [ ] `https://almanyar.com/fa/about` — page renders; placeholder silhouette image present; bio paragraphs visible; "اصول کاری من" bullets present; WhatsApp + contact-form CTAs at the bottom.
- [ ] Header has "درباره ما" between "نحوه کار ما" and "خدمات ما".
- [ ] Footer has "تماس" column on the right (md+) with email + WhatsApp + city. **No** social icons anywhere.
- [ ] Footer disclosure line "آلمانیار یک منبع اطلاع‌رسانی مستقل است…" present above the © (Phase-2 LEGAL-05).
- [ ] view-source on `/fa` — find `"@type":"Person"`, then `"name":"محمد جهانبانی"`, `"affiliation":{"@type":"EducationalOrganization","name":"İstanbul Medipol Üniversitesi"…}`, `"sameAs":[]`.

**Homepage**
- [ ] Hero (cinematic): first scene now reads "مهاجرت تحصیلی به آلمان از ترکیه" + "سفارت آلمان در تهران غیرقابل پیش‌بینی است…". Old lyrical caption gone.
- [ ] Below the cinematic: three trust cards (🇹🇷 / 🔓 / 🤝) with the new wording + "بیشتر درباره ما ←" link to `/fa/about`.
- [ ] Hero stats grid shows TWO cards: "۲۰+ دانشجوی موفق" and "۶ سال تجربه". Partner-universities, success-rate, ratings, testimonials remain hidden (BUG-03 hide rule).
- [ ] Floating green WhatsApp button at bottom-left on every `/fa/*` page; opens wa.me with prefilled message; absent on `/admin`, `/login`.

**Forms**
- [ ] `/fa/evaluation` step 5: terms checkbox AND new amber Germany-risk checkbox both required. Submit without the Germany-risk box → Persian error "برای ارسال فرم، تایید سلب مسئولیت مسیر آلمان لازم است."
- [ ] Same for the contact form last step.
- [ ] Server-side: POST `/api/contact` with `consent.termsAccepted=true` but `consent.germanyRiskAcknowledged=false` → 400 with the same error.

**How-it-works**
- [ ] `/fa/how-it-works` step 4 ("مسیر آلمان") now has an amber-bordered callout under the step body with the no-guarantee paragraph.

**Stats migration**
- [ ] After deploy, `docker compose logs app | grep migrat` shows the two new migrations applied (`20260523_seed_real_stats` and `20260523_add_germany_risk_consent`).
- [ ] `psql … "SELECT \"studentsCount\", \"yearsExperience\" FROM \"SiteStats\";"` returns `20 | 6`.

---

## Test execution — gated on your approval

Spec files for every TRUST task are written and committed. Per your mid-phase
directive, no Playwright runs were executed this session.

When you're ready, I'll run the full Phase-1 + 2 + 3 batch as a single
command:

```bash
PLAYWRIGHT_PORT=3055 npx playwright test tests/phase-1 tests/phase-2 tests/phase-3
```

Expected totals: **Phase 1 = 37 tests**, **Phase 2 = ~44 tests** (1 was skipped
during Phase-2), **Phase 3 = ~16 tests across 11 specs**.

Reply "run tests" to proceed, or "ship" if you want to deploy first and run
the suite against production via `PLAYWRIGHT_BASE_URL=https://almanyar.com`.
