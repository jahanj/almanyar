# Phase 3 — Trust & Authority Plan

> Audit done; no production code touched yet. Approve before I start.

---

## 1. Where Phase 2 left us, relevant to Phase 3

| Surface | State after Phase 2 |
|---|---|
| Person JSON-LD | `name: SITE.name` (="آلمانیار"), `image: /logo.png`, `contactPoint.url: /fa#contact`, `sameAs: SITE.social` (the IG + Telegram placeholders). No `affiliation`. |
| Footer | Has nav links + LEGAL row + LEGAL-05 disclosure line + © — **no contact info column.** |
| Homepage | Hero = `CinematicJourneyHero` (gsap pinned cinematic). Below it: `TrustModel` (Phase-2 §POSITIONING-02 — four bullets). The cinematic hero already has a WhatsApp link inside the AlmanYar reveal scene; the page has no site-wide floating button. |
| `SiteStats` | Schema + admin form exist (Phase-1 BUG-03). Singleton row inserted as all-NULL by migration; **never populated.** Homepage hides every stat. |
| `WhatsAppButton` | Doesn't exist yet. |
| `/fa/how-it-works` | Already exists (Phase 2). Has the four-step model + "چرا این مدل به نفع شماست" + final CTA. No Germany-specific honesty paragraph beyond what step 4 already says. |
| Consent gate on forms | Single required checkbox (terms + privacy). No `germany_risk_acknowledged` second checkbox. |
| Stale "team/company" language | Audit pulls **6 hits**: 4 page-CTA copies + 2 form-success messages all use "کارشناسان ما". 0 hits for "تیم ما" / "شرکت ما" / "متخصصان ما" today (POSITIONING-03 already removed the only "تیم ما"). |

---

## 2. Strategic decisions — call out, get ack

1. **Photo placeholder** = neutral SVG silhouette (option 1 per spec), 800×800, brand colors. Lives at `public/team/mohammad-jahanbani.jpg` even though the file is actually SVG content (avoids a Next/image extension lookup change later when the JPG arrives). Decision: store as `.svg` at `public/team/mohammad-jahanbani-placeholder.svg`, reference it via `next/image` with an explicit `width`/`height` so the swap to a JPG just needs the file change + one URL edit. **Open Q in §5.A** — confirm filename strategy.
2. **Owner identity in `Person` LD**: rename `Person.name` from "آلمانیار" → "محمد جهانبانی". Keep `alternateName: "آلمانیار"` so search still associates the brand. `SITE.name` stays "آلمانیار" — that's the publisher brand for OG/Twitter cards + UI; only Person LD changes.
3. **`sameAs: []`** — drop the IG + Telegram placeholders entirely. Per the spec: "NO social media (no Instagram, no Telegram, no LinkedIn — do not add icons or placeholders)". Edit `SITE.social` to `[]`.
4. **Affiliation** = `EducationalOrganization` for Medipol per spec. Includes `url: https://www.medipol.edu.tr`.
5. **Stats**: only `studentsCount=20` and `yearsExperience=6` visible. Plan ships a seed update that writes these to the `SiteStats` singleton at migration time (idempotent — only sets the columns if they're NULL today, so a future admin edit isn't clobbered).
6. **Floating WhatsApp button**: site-wide, bottom-left (RTL), z-index < cookie notice. Hidden by route prefix check — render only when `pathname.startsWith('/fa/')` or `=== '/fa'`. Avoids leaking into admin/dashboard/auth surfaces.
7. **Germany-risk acknowledgment checkbox** (TRUST-10): second required checkbox on eval + contact forms, additive DB columns `germanyRiskAcknowledged: Boolean?` + `germanyRiskAcknowledgedAt: DateTime?`. Same shape as Phase-2 LEGAL-04 — additive nullable migration.
8. **Hero rewrite (TRUST-07)**: the cinematic hero copy is embedded in `CinematicJourneyHero.tsx`. The H1 "هر مسیر بزرگی، از یک تصمیم شروع می‌شود" lives in the Iran scene's caption. The new spec wants a sharper embassy-driven H1 — **this would change the cinematic narrative arc.** The cinematic hero tells a story (Iran → flight → Turkey → Germany → AlmanYar reveal); the user-facing H1 across that story is the Iran-scene caption. **Open Q in §5.B**: do I (a) replace the Iran-scene caption with the new H1 + subheadline + two CTAs (preserving the cinematic flow but changing the entry copy), or (b) replace the cinematic hero entirely with a static hero on `/fa`, or (c) keep the cinematic hero AND add a sharper static hero band above/below it for SEO/AEO. My recommendation: **(a) — change the Iran-scene caption only**. The cinematic hero is the homepage's most distinctive asset; replacing it would erase Phase-1's biggest commit. Sharper copy at the entry point gives the SEO/positioning win without losing the storytelling.

---

## 3. Per-task plan

### TRUST-11 — Audit "team/company" language (done first per spec)
Findings (full table will be in PHASE-3-REPORT.md):

| File:Line | Match | Decision |
|---|---|---|
| `src/app/[locale]/guide/page.tsx:263` | "**کارشناسان ما** رایگان شرایط شما را بررسی می‌کنند." | Rewrite → "**من** رایگان شرایط شما را بررسی می‌کنم." |
| `src/app/[locale]/turkey-costs/page.tsx:130` | "برای مشاوره دقیق متناسب با شرایط شما با **کارشناسان ما** در تماس باشید." | Rewrite → "… با **ما** در تماس باشید." |
| `src/app/[locale]/turkey-residence/page.tsx:194` | "**کارشناسان ما** در تمام مراحل از پذیرش تا صدور کارت همراه شما هستند." | Rewrite → "**ما** در تمام مراحل از پذیرش تا صدور کارت همراه شما هستیم." |
| `src/app/[locale]/exams/page.tsx:143` | subtitle: "… **کارشناسان ما** تماس می‌گیرند …" | Rewrite → "… **ما** تماس می‌گیریم …" |
| `src/components/EvaluationWizard.tsx:212` | success-page copy: "**کارشناسان ما** شرایط شما را با دقت بررسی می‌کنند …" | Rewrite → "**من** شرایط شما را با دقت بررسی می‌کنم …" |
| `src/components/ContactForm.tsx:228` | success-page copy: "**کارشناسان ما** به‌زودی برای هماهنگی با شما تماس می‌گیرند." | Rewrite → "**ما** به‌زودی برای هماهنگی با شما تماس می‌گیریم." |

**No legitimate "kept" hits** — every match refers to Almanyar itself.

Test `tests/phase-3/11-team-audit.spec.ts` enforces zero `کارشناسان ما` / `تیم ما` / `شرکت ما` / `متخصصان ما` in `src/`. Same shape as POSITIONING-03's audit test.

**Commit 1.**

### TRUST-02 — Photo placeholder + infrastructure
- `public/team/mohammad-jahanbani-placeholder.svg` — neutral silhouette, 800×800, brand emerald.
- `src/lib/owner.ts` — exports a single constant `OWNER_PHOTO_URL = '/team/mohammad-jahanbani-placeholder.svg'` so the swap to a JPG is one constant update. Both `/fa/about` page (TRUST-01) and Person LD (TRUST-04) read from here.
- **TODO in PHASE-3-REPORT.md** — bold warning to replace before public marketing.

**Commit 2.**

### TRUST-01 — `/fa/about`
New page `src/app/[locale]/about/page.tsx` reusing `PageHero` shell. Content typed in `src/lib/owner-content.ts` (parallel to `legal-content.ts` + `positioning-content.ts`). Renders:
- intro 3-paragraph bio + photo side-by-side (Grid: photo on the start side in RTL, text on end)
- «چرا آلمانیار؟» story section
- «چه می‌توانم برای شما انجام دهم؟» service breakdown
- «اصول کاری من» bullets
- Two CTAs at bottom (WhatsApp + #contact)

PageMetadata title: "درباره محمد جهانبانی — بنیان‌گذار آلمانیار".
Article LD with `author/publisher = #person`. BreadcrumbList LD.

`site-routes.ts` registers the path so it appears in sitemap.xml.

**Commit 3.**

### TRUST-04 — Person LD identity update
Edit `src/lib/seo.ts`:
- `personLd()` returns `name: 'محمد جهانبانی'`, `alternateName: 'آلمانیار'`, `image: absoluteUrl(OWNER_PHOTO_URL)`, plus new `affiliation` and `sameAs: []`.
- `SITE.social` → `[]` (drop the IG + Telegram placeholders).
- `contactPoint.availableLanguage: ['fa', 'tr']` per spec (drop German + English from the contact point — owner only speaks-the-language for support in fa + tr; the Person.knowsLanguage list still has all four).
- `aggregateRating` block in `personWithRatingLd` is unchanged.

Test `tests/phase-3/04-person-identity.spec.ts` extracts Person LD from `/fa`, asserts `name === 'محمد جهانبانی'`, `alternateName === 'آلمانیار'`, `image` ends in the placeholder filename, `affiliation.name === 'İstanbul Medipol Üniversitesi'`, `sameAs === []`.

**Commit 4.**

### TRUST-05 — Real stats seed
Two paths considered:
1. Edit `prisma/seed.ts` to upsert `SiteStats` with `studentsCount=20, yearsExperience=6` if those columns are NULL.
2. Add a one-off migration `prisma/migrations/<ts>_seed_real_stats/migration.sql` that does the same UPDATE.

Pick **(2)** — it runs automatically on the next `docker compose up -d --build app` deploy via `prisma migrate deploy`. The seed.ts route doesn't run unless someone manually invokes it, and we want the value live without manual steps.

Migration SQL:
```sql
UPDATE "SiteStats"
SET "studentsCount" = 20, "yearsExperience" = 6
WHERE "id" = 1
  AND "studentsCount" IS NULL
  AND "yearsExperience" IS NULL;
```
Idempotent: if owner has already set values via /admin/stats, the WHERE clause skips it.

`/admin/stats` already exists for future bumps (Phase 1).

Test: `tests/phase-3/05-stats-visible.spec.ts` asserts the homepage shows two stat cards ("۲۰" with دانشجوی موفق label, "۶" with سال تجربه label) and does NOT show universities/success/ratings/reviews.

**Commit 5.**

### TRUST-06 — Homepage "چرا آلمانیار؟" 3-card section
The Phase-2 `TrustModel` component already exists with 4 bullet-style cards. **Replacement**: rewrite `TrustModel.tsx` to render the 3 spec'd cards (icon + title + body) instead of bullets. Wording from the spec.

Keep `data-testid="trust-model"` for the existing Phase-2 test to keep passing (selector match → test updates to check for 3 new headings + the new CTA copy).

**Commit 6.**

### TRUST-07 — Hero embassy-driven copy
Per Open Q §5.B decision: change the Iran-scene caption in `CinematicJourneyHero.tsx`. Two captions in that scene today:
- eyebrow: "📍 ایران"
- title: "هر مسیر بزرگی، از یک تصمیم شروع می‌شود"
- subtitle: "همه‌چیز با یک رؤیا آغاز می‌شود؛ رؤیای ساختن آینده‌ای تازه در آلمان."

New copy:
- title: "مهاجرت تحصیلی به آلمان از ترکیه"
- subtitle: "سفارت آلمان در تهران غیرقابل پیش‌بینی است. مسیر امن از ترکیه شروع می‌شود — ۶ ماه آماده‌سازی، اقامت دانشجویی، سفارت قابل دسترس."

CTAs in the cinematic hero live in the AlmanYar reveal scene (final scrubbed scene), not the Iran scene. The Iran scene currently has no CTAs. Adding two CTAs to the Iran scene would clutter it. **Counter-proposal**: put the two new CTAs in the post-hero `TrustModel` section (TRUST-06) instead — same screen real estate, doesn't break the cinematic timeline. Flag in §5.B as a sub-question.

`StaticFallback` (reduced-motion path) gets the same copy update.

**Commit 7.**

### TRUST-03 — Footer contact column
Edit `src/components/Footer.tsx`. Add a "تماس" column to the existing flex layout. Three items:
- `<a href="mailto:contact@almanyar.com">contact@almanyar.com</a>`
- `<a href="https://wa.me/905067708295?text=…prefilled…">+90 506 770 8295</a>` (uses the same prefilled message helper as TRUST-08)
- Plain text "استانبول، ترکیه"

No social icons. The existing nav + LEGAL row + disclosure line stay.

Extract the prefilled WA URL + message into `src/config/contact.ts` so the floating button, header CTA, and footer all read the same source.

**Commit 8.**

### TRUST-08 — Floating WhatsApp button
- `src/components/contact/WhatsAppButton.tsx` — Client component with a fixed bottom-left button (RTL site, bottom-left = thumb side).
- Brand green (#25D366), official WhatsApp SVG (24×24 in the button), scale-1.1 hover, smooth transition.
- `aria-label="گفت‌وگو در واتساپ"`, opens `WA_URL` (from `src/config/contact.ts`).
- Mounted from `src/app/[locale]/layout.tsx` AFTER `<CookieNotice>` so cookie notice's higher z-index covers it on first visit.
- z-index plan: cookie notice = z-50 (current), WhatsApp = z-40. Both stay above content.

Test: `tests/phase-3/08-whatsapp-button.spec.ts` — button visible on /fa, /fa/guide, /fa/about; absent on /admin (the admin layout owns the chrome — verify); has correct href + aria-label.

**Commit 9.**

### TRUST-09 — Honest Germany disclosure in `/fa/how-it-works`
Insert the spec'd paragraph as a new highlighted box inside the existing «مسیر آلمان» step in `positioning-content.ts → HOW_IT_WORKS.steps[3]`. Render as a callout sub-block in the page; same data-testid `last-updated` machinery unchanged.

**Commit 10.**

### TRUST-10 — Germany-risk checkbox + migration
1. Prisma schema: add `germanyRiskAcknowledged: Boolean?` and `germanyRiskAcknowledgedAt: DateTime?` to both `Evaluation` and `ContactRequest`. Additive nullable — same shape as LEGAL-04.
2. Migration `prisma/migrations/<ts>_add_germany_risk_consent/migration.sql`.
3. Update `src/lib/consent.ts`: extend `ConsentInputSchema` with `germanyRiskAcknowledged: z.boolean()`. New `consentDbFields()` writes `germanyRiskAcknowledgedAt = new Date()` when the box is true.
4. API routes: reject the submission (400, Persian message) if `germanyRiskAcknowledged !== true`.
5. EvaluationWizard step 4 + ContactForm step 3: second required checkbox renders below the existing terms checkbox. Asterisk, zod-validated client-side.

Test `tests/phase-3/10-germany-risk.spec.ts`: walks the eval wizard, asserts both checkboxes present, asserts that filling terms-only fails with the new Germany-risk message.

**Commit 11.**

---

## 4. Order of execution (matches the spec)

1. TRUST-11 (audit) — locks honest copy direction
2. TRUST-02 (photo placeholder + infrastructure)
3. TRUST-01 (about page)
4. TRUST-04 (Person LD identity)
5. TRUST-05 (real stats seed + migration)
6. TRUST-06 (homepage trust section rewrite)
7. TRUST-07 (hero copy update inside cinematic)
8. TRUST-03 (footer contact column)
9. TRUST-08 (floating WhatsApp button)
10. TRUST-09 (Germany honesty in how-it-works)
11. TRUST-10 (Germany-risk checkbox + migration)

Each commit ends green-tested; full Phase-1 + Phase-2 + Phase-3 suite must stay green at each step.

---

## 5. Open decisions — please ack (4 items)

| # | Question | My default | If you'd rather |
|---|---|---|---|
| **A** | Photo placeholder file format: SVG silhouette stored as `public/team/mohammad-jahanbani-placeholder.svg`, swapped via a one-constant edit (`OWNER_PHOTO_URL` in `src/lib/owner.ts`). | **SVG placeholder, separate filename from the eventual JPG** | Reply "use jpg from day one — replace the file" |
| **B** | Hero update (TRUST-07): replace the Iran-scene caption inside the cinematic hero with the new H1 + subheadline. CTAs go into the new TrustModel block below the cinematic hero (rather than into the Iran scene itself, which would clutter the scroll narrative). | **Caption swap + CTAs in TrustModel** | (a) full hero replacement, or (b) keep current cinematic + add a static SEO hero band above it — reply with the option letter |
| **C** | `Person.contactPoint.availableLanguage`: drop to `['fa','tr']` per the TRUST-04 spec (the wider `Person.knowsLanguage` keeps all four: fa/tr/de/en). | **Yes, `['fa','tr']` for support** | Reply "keep all four" |
| **D** | Stats seed mechanism: one-off `prisma/migrations/<ts>_seed_real_stats/migration.sql` that runs idempotently on next deploy. Safer than editing seed.ts (which only runs on manual invocation). | **Migration** | Reply "edit seed.ts instead" |

---

## 6. TODO placeholders coming out of Phase 3

Will be listed in PHASE-3-REPORT.md. Headline:

1. **⚠️ REPLACE `public/team/mohammad-jahanbani-placeholder.svg` with the real owner photo (watermark removed) BEFORE marketing the site publicly.** Filename for the real photo: `public/team/mohammad-jahanbani.jpg`. Then edit `OWNER_PHOTO_URL` in `src/lib/owner.ts` to point at the JPG.
2. **Future**: if/when real Instagram or Telegram channels go live, append their URLs to `SITE.social` (currently `[]`) AND add icons to the footer (currently no icon row).
3. **Future**: collect real reviews via `/api/reviews` (already wired Phase-1). Once 5+ approved reviews land, `personWithRatingLd` will automatically attach `aggregateRating` to Person LD and the Testimonials section will appear on the homepage (Phase-1 BUG-03 gate).
4. **Future**: when partner-universities count + success rate become defensible numbers, fill them via `/admin/stats`. Stat cards will reappear automatically (Phase-1 BUG-03 hide rule).
5. **Marketing-photo hand-off** — once the owner provides any additional photos for the about page (study desk shot, Istanbul backdrop, etc.), drop them in `public/team/` and add captions.

---

## 7. Tests added (`tests/phase-3/`)

```
01-about-page.spec.ts          — TRUST-01: page exists + all 4 sections + bio + CTAs
02-photo-placeholder.spec.ts   — TRUST-02: image element loads, alt text correct
03-footer-contact.spec.ts      — TRUST-03: email + WA + city visible, NO social icons
04-person-identity.spec.ts     — TRUST-04: Person LD name=محمد جهانبانی, affiliation, sameAs=[]
05-stats-visible.spec.ts       — TRUST-05: 2 stat cards visible (20+, 6), others absent
06-trust-cards.spec.ts         — TRUST-06: 3 cards present + CTA to /about
07-hero-copy.spec.ts           — TRUST-07: new H1 + embassy-driven subtitle render
08-whatsapp-button.spec.ts     — TRUST-08: visible on /fa pages, hidden on /admin
09-germany-honesty.spec.ts     — TRUST-09: paragraph present in /fa/how-it-works step 4
10-germany-risk.spec.ts        — TRUST-10: 2nd checkbox required, gate blocks submission
11-team-audit.spec.ts          — TRUST-11: zero stale team/company language
```

All Phase-1 (37) + Phase-2 (44, of which 1 skipped) tests must continue to pass.

---

## 8. Rollback strategy

| Layer | Rollback |
|---|---|
| Per-task commits | `git revert <sha>` — each commit is self-contained. |
| DB migrations | Two new migrations (real stats seed + Germany-risk consent fields). Both additive + idempotent. Rollback: `ALTER TABLE … DROP COLUMN …` for TRUST-10; `UPDATE SiteStats SET … = NULL WHERE id = 1` for TRUST-05. |
| Cinematic hero copy | One-line edit per caption + a small `StaticFallback` mirror. `git revert` restores the lyrical Iran-scene wording. No animation/timeline change. |
| Photo placeholder | Pure additive: the SVG file lands in `public/`, and `next/image` references it. Revert removes both the file and the reference. |
| Person LD identity | One commit. Revert restores "آلمانیار" + the social placeholders. |

---

## 9. What I need from you to proceed

1. Ack decisions **A–D** in §5 (or override).
2. Confirm the Phase-2 deploy is working as you expect (already live: cookie notice, /fa/disclaimer, /fa/privacy, /fa/how-it-works, /fa/germany-visa hub).
3. Say "go" and I start with **TRUST-11 (team audit + 6 rewrites)**.
