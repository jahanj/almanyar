# Phase 2 — SEO + Light Legal + Service Model Plan

> Read‑only audit done; no production code has been touched yet.
> Approve this plan before I write anything.

---

## 1. Where Phase 1 left us — relevant to Phase 2

| Surface | State after Phase 1 |
|---|---|
| Routes | All public pages under `/fa/*`; auth/dashboard/admin/api un‑prefixed. |
| `pageMetadata` (lib/seo.ts) | Emits `alternates.canonical` + `alternates.languages` (currently only `fa` because `locales = ['fa']`). Truncates description on whitespace. No `keywords` field. |
| `<meta name="keywords">` | Already removed everywhere (BUG-07). Only need to re-verify with a stronger test for SEO-01. |
| JSON-LD builders in `lib/seo.ts` | `organizationLd`, `websiteLd`, `serviceLd(ProfessionalService)`, `articleLd`, `faqLd`, `breadcrumbLd`. All emitted today — **Organization-shaped, with phone/email and `priceRange '$$'`.** Phase 2 must rebuild around `Person`. |
| Sitemap | `src/app/sitemap.ts` lists a curated set of `/fa/*` routes + all `TOPICS`. No per-entry `alternates.languages` block (Next supports this — would emit `<xhtml:link>`). |
| robots.txt | `src/app/robots.ts` already disallows `/api/`, `/admin`, `/dashboard`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`. **No staging gate.** |
| Header / Footer | Single source from `[locale]/layout.tsx`; nav from `src/config/navigation.ts`. |
| Last-updated dates | Only `/fa/turkey-costs` shows one (via PageHero eyebrow). 0/35 topic pages, 0/4 other content pages. |
| `/fa/germany-visa` | Single page that is BOTH the navigational hub AND the "ویزای آلمان چیست؟" article (it's the topic `TOPIC_BY_PATH['/germany-visa']`). Needs splitting per SEO-07. |
| Forms | Evaluation + contact forms have no consent checkbox. `Evaluation` + `ContactRequest` Prisma models have no consent fields. |
| Cookie notice | None. |
| Disclaimer / Privacy / How-it-works | Not present. |
| Footer | Reads `dict.footer.rights` + nav links; no disclosure line. |

---

## 2. Strategic decisions — call them out now

1. **Swap `Organization` → `Person`** site-wide in JSON-LD. The current `organizationLd` is `@id: '/#organization'` and referenced by `serviceLd.provider`, `articleLd.author/publisher`. Replace with a `personLd` builder whose `@id: '/#person'`; rewire every consumer. Delete `organizationLd` after callers move (single grep). Per spec.
2. **Replace the single `serviceLd(ProfessionalService)` with three focused `Service` builders.** Current shape implies a paid catalog at "$$" which contradicts the actual business model. Phase-2 builders:
    - `turkishAdmissionServiceLd()` — free, `Offer.price="0"` `Offer.priceCurrency="TRY"`, `availability: InStock`, `areaServed: Turkey`.
    - `settlementServiceLd()` — no `Offer.price`, links `termsOfService` to `/fa/how-it-works`, `areaServed: Turkey`.
    - `germanyConsultingServiceLd()` — no `Offer.price`, description scoped to "guidance and support" (not guaranteed outcome).
    The old `serviceLd()` gets retired. Where the homepage currently calls `serviceLd(locale)`, it'll switch to a combined array of all three.
3. **`Review` + `AggregateRating`** — gated behind `SiteStats.reviewsCount >= 5` (re-use BUG-03 hide rule). Embedded on the Person itself (`Person.aggregateRating`) — not on a service — so we don't claim ratings about a specific offering we can't substantiate.
4. **Auth/dashboard/admin/api stay un-prefixed** (carry from Phase 1). Sitemap excludes them; robots Disallows them.
5. **Staging vs production gate** via `process.env.NEXT_PUBLIC_ENV` (or `NODE_ENV !== 'production'` as fallback). On staging: robots returns `Disallow: /`. **One open decision below (D)** — confirm the env var name you want.
6. **Cookie notice = simple bottom bar, not a Radix Dialog.** Pure CSS slide-up, dismissed via a single button, persisted to `localStorage["almanyar_cookie_notice_dismissed_v1"]`. Re-appears if the `_v1` is bumped or after 12 months (timestamp comparison). Aria-live polite; not focus-trapping. Per spec §LEGAL-03.
7. **Consent record schema is additive.** New nullable columns on both `Evaluation` and `ContactRequest`: `consentAcceptedAt`, `consentTermsVersion`, `consentIp`, `consentUserAgent`, `marketingConsent`. No backfill. New submissions write them; old rows stay NULL. Rollback = drop the columns.
8. **"Last updated" date.** Source of truth: a new `updatedAt: string` (ISO date) field added to each `TopicContent` entry in `src/lib/topic-content/*.ts`, and to a small `STATIC_PAGE_DATES` map for the four bespoke pages (`guide`, `evaluation`, `germany-visa-from-turkey`, `turkey-residence` already partly has it). Rendered via `Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'long' })` — uses Persian (Jalali) calendar **without adding a new dep**. Article JSON-LD `dateModified` uses the ISO version of the same value.
9. **Visa hub split.** Migration plan:
    - In `src/lib/germany-topics.ts`, change topic href `/germany-visa` (currently the "ویزای آلمان چیست؟" topic) to `/germany-visa/what-is`. That moves the long-form article to its own page.
    - Add a redirect `/(fa/)?germany-visa#whatever → /fa/germany-visa/what-is` in `next.config.js` so the article URL never 404s if Google had cached the `/fa/germany-visa` long-form.
    - The bare segment `/fa/germany-visa` then naturally falls back to the `groupIndexPage()` (already built in Phase 1 BUG-01) which lists all visa-group topic links — that IS the hub layout, so no new component is needed.
10. **JSON-LD lifecycle.** Single point of injection: a new `<JsonLd>` (uses existing component) call inside `[locale]/layout.tsx` for site-wide objects (Person + WebSite with SearchAction placeholder), and `[locale]/<route>/page.tsx` for per-page objects. Per-page JSON-LD never repeats Person/WebSite — references them by `@id`. Eliminates duplication.

---

## 3. Per-task plan

### SEO-01 — Verify zero `<meta name="keywords">`
**Already done in Phase 1** (BUG-07). Phase 2 just adds a Playwright spec that crawls every URL in `sitemap.xml` and asserts `meta[name="keywords"]` count is 0. Already exists at `tests/phase-1/07-meta.spec.ts` for a hard-coded subset; Phase-2 makes the test discover URLs dynamically from sitemap.

**Files**: new `tests/phase-2/01-no-keywords.spec.ts`. **Risk**: nil.

### SEO-02 — hreflang
`pageMetadata` already wires `alternates.languages` from a `languageAlternates(path)` helper that iterates `locales`. Two issues:
- The map currently emits only `fa` and `x-default` (both → `/fa/<path>`). That's actually correct for today.
- Spec asks to **"reserve hreflang for tr and en, but only emit if a translated version exists"** — so we keep emitting only fa+x-default until those translations land. No code change needed for emission yet. **Add an opt-in `translatedLocales` field** on `PageMetaInput` so individual pages can declare extra languages once translations exist (forward-compatible, no behavior change today).
- Update `<head>` JSON-LD `Person.knowsLanguage` to `["fa","tr","de","en"]` per spec.

**Files**: `src/lib/seo.ts` (`languageAlternates` + `PageMetaInput.translatedLocales`); new test `tests/phase-2/02-hreflang.spec.ts` that asserts every `/fa/*` page has exactly one `<link rel=alternate hreflang=fa>` and one `<link rel=alternate hreflang=x-default>` (no stray tr/en until translated content lands).
**Risk**: Low.

### SEO-03 — JSON-LD (the big SEO ticket)
A. **New `lib/seo/jsonld.ts`** (single module with all builders) — actually I'll keep them in `lib/seo.ts` to avoid a churn move; just add the new builders and retire the old ones.

B. Builders (all return typed `WithContext<...>` from `schema-dts`):
   - `personLd()` — exactly per spec §SEO-03 (with `knowsAbout` list).
   - `webSiteLd()` — replaces existing `websiteLd`; adds `potentialAction: { @type: SearchAction, target: '/fa/search?q={search_term_string}', 'query-input': 'required name=search_term_string' }` as a placeholder.
   - `turkishAdmissionServiceLd(locale)`, `settlementServiceLd(locale)`, `germanyConsultingServiceLd(locale)` — three Service objects per the spec.
   - `articleLd({ headline, datePublished, dateModified, path, image? })` — `author` and `publisher` both `{ @id: '/#person' }`.
   - `breadcrumbLd` — already exists, unchanged.
   - `faqLd` — already exists, unchanged. Re-used wherever the visible accordion renders.
   - `personWithRatingLd(stats: SiteStatsView)` — wraps `personLd()` and folds in `aggregateRating` ONLY when `stats.reviews >= 5`.

C. Wiring:
   - `[locale]/layout.tsx` emits `personLd` + `webSiteLd` once.
   - `[locale]/page.tsx` (homepage) emits the three Service objects + `faqLd(dict.services.faq)` + `personWithRatingLd(stats)`.
   - `topic-route.tsx` continues to emit `breadcrumbLd` + `articleLd` + `faqLd` (already in place; just point them at `personLd`'s `@id`).
   - `/fa/services/*` topic pages get the appropriate Service object based on which sub-segment (admission / settlement / germany).
   - `/fa/how-it-works` (new) emits Article + BreadcrumbList + the three Service objects.

D. Install `schema-dts` (`@types/schema-dts` is bundled with the package). 1 dep, types-only — zero runtime cost.

**Files touched**: `src/lib/seo.ts`, `src/app/layout.tsx` (remove organizationLd/websiteLd), `src/app/[locale]/layout.tsx` (add personLd/webSiteLd), `src/app/[locale]/page.tsx`, `src/lib/topic-route.tsx`, `src/app/[locale]/services/[[...slug]]/page.tsx` (if it needs a per-slug service object — likely just relies on topic-route, with topic-route picking the right Service builder based on `params.slug[0]`).
**Risk**: Medium — many callers move. Tests: `tests/phase-2/03-jsonld.spec.ts` extracts every `<script type=application/ld+json>` on key pages, parses, validates against `schema-dts` shape (compile-time on test) + asserts: exactly one Person, exactly one WebSite, no Organization, Service prices match the model (free TR admission has `price=0`, settlement+germany have no `price`).

### SEO-04 — Dynamic sitemap.xml
Rewrite `src/app/sitemap.ts`:
- Build the route list from a single registry: `src/config/site-routes.ts` exporting `PUBLIC_ROUTES: { path, priority, changeFreq, lastModified? }[]`.
- Include: home, every static `[locale]/*` page, every `TOPICS` href, the new `/fa/how-it-works`, `/fa/disclaimer`, `/fa/privacy`.
- For each entry, emit `alternates.languages` (Next-supported, generates `<xhtml:link rel=alternate hreflang=fa>`). Once tr/en translations land, the alt map grows there; no sitemap edit.
- `lastModified` from per-content `updatedAt` (TopicContent + static map) — falls back to current build time.
- Excludes auth/admin/api/_next (those never appear because the route list is explicit).

**Files**: `src/app/sitemap.ts`, new `src/config/site-routes.ts`. **Test**: `tests/phase-2/04-sitemap.spec.ts` fetches `/sitemap.xml`, parses, asserts: every `/fa/*` route present, every URL has `<xhtml:link hreflang=fa>`, no `/admin`/`/login`/`/api` entries.
**Risk**: Low.

### SEO-05 — robots.txt
Modify `src/app/robots.ts` to gate behind `process.env.NEXT_PUBLIC_ENV`:
- `production` (default) → current rules unchanged.
- Anything else → `Disallow: /` only (with no `Sitemap:` line).

**Files**: `src/app/robots.ts`, `next.config.js` (expose `NEXT_PUBLIC_ENV` already available). **Test**: `tests/phase-2/05-robots.spec.ts` (curl `/robots.txt`, assert allows + disallows correctly).
**Risk**: Nil.

### SEO-06 — "Last updated" date
- Add `updatedAt: string` (ISO `YYYY-MM-DD`) to every `TopicContent` in `src/lib/topic-content/*.ts` (35 entries). Authoring date = file's last git commit (script-generated initial fill, can be overridden per topic).
- Add `STATIC_PAGE_UPDATED` map in `src/config/site-routes.ts` for the four bespoke pages.
- New helper `formatJalali(iso: string): string` in `src/lib/dates.ts` using `Intl.DateTimeFormat('fa-IR-u-ca-persian')`. No new dep.
- In `topic-route.tsx`, render `<p>آخرین به‌روزرسانی: {formatJalali(content.updatedAt)}</p>` directly below H1 in `PageHero` (or as a small line under it). Already the `turkey-costs` pattern uses PageHero `eyebrow` for this — switch all pages to a consistent place under the title.

**Files**: 35 content files (one-line `updatedAt:` insert each), `src/lib/topic-content/types.ts` (add field — optional initially), `src/lib/topic-route.tsx`, `src/lib/dates.ts` (new), `src/components/PageHero.tsx` (display).
**Test**: `tests/phase-2/06-last-updated.spec.ts` asserts each guide/visa/exam/work/jobs/life page shows a Jalali date string and the Article JSON-LD `dateModified` ISO matches.
**Risk**: Low.

### SEO-07 — `/fa/germany-visa` hub split
- In `src/lib/germany-topics.ts`, change one topic line:
  ```diff
  - { title: 'ویزای آلمان چیست؟', href: '/germany-visa', ... }
  + { title: 'ویزای آلمان چیست؟', href: '/germany-visa/what-is', ... }
  ```
  All slug-based machinery + `groupIndexPage()` already work: with no `/germany-visa` topic, the bare segment now naturally renders the group-index hub (good); the article gets a single-segment URL.
- `next.config.js` redirects: add the legacy URL: `/germany-visa → /fa/germany-visa/what-is`? — **No, don't.** Currently `/germany-visa` is already 308-redirected to `/fa/germany-visa` (Phase 1). After the topic move, `/fa/germany-visa` becomes the hub (still 200), and the article lives at `/fa/germany-visa/what-is`. The original article URL had been `/fa/germany-visa` for at most a week (since Phase 1 ship). Probably safe to skip an extra 301 — but **adding a server-side note**: I'll add the redirect anyway to be conservative.
- Update copy: hub page should have a one-paragraph intro that includes a prominent link to `/fa/germany-visa/what-is`. The `groupIndexPage()` from BUG-01 renders generic "موضوعات این بخش را در ادامه ببینید." subtitle — Phase 2 enhances this so visa-group gets a custom intro.

**Files**: `src/lib/germany-topics.ts`, `src/lib/topic-route.tsx` (group-specific intro hook), `next.config.js` (one extra redirect entry).
**Test**: `tests/phase-2/07-visa-hub.spec.ts` asserts: `/fa/germany-visa` returns 200 + contains a link to `/fa/germany-visa/what-is`; `/fa/germany-visa/what-is` returns 200 + has the article body (FAQ accordion present).
**Risk**: Medium — affects the most-trafficked /fa/germany-visa page. Mitigation: keep the redirect.

### LEGAL-01 — `/fa/disclaimer`
New page `src/app/[locale]/disclaimer/page.tsx`. Reuses `PageHero` + the `topic-route` body shell. Content lives in `src/lib/legal-content.ts` (typed exports) so the same source can power JSON-LD if needed later.
Add the **«آلمانیار یک منبع اطلاع‌رسانی مستقل…»** disclosure to the footer (LEGAL-05).
`STATIC_PAGE_UPDATED` carries the page's `updatedAt`.

**Files**: `src/app/[locale]/disclaimer/page.tsx`, `src/lib/legal-content.ts`. **Test**: `tests/phase-2/08-disclaimer.spec.ts` — page returns 200, contains all required Persian phrases, link to `/fa/how-it-works` works.

### LEGAL-02 — `/fa/privacy`
Same shape as LEGAL-01. The spec has a `[TODO: owner provides contact email]` placeholder — surfaced in §6.

**Files**: `src/app/[locale]/privacy/page.tsx`, `src/lib/legal-content.ts`.
**Test**: `tests/phase-2/09-privacy.spec.ts`.

### LEGAL-03 — Cookie notice
New client component `src/components/legal/CookieNotice.tsx`. Mounted from `[locale]/layout.tsx`. State machine:
```
mount → check localStorage["almanyar_cookie_notice_dismissed_v1"]
  → if absent or timestamp > 12 months → show bar
  → on click "متوجه شدم" → write { v: 1, dismissedAt: Date.now() } + hide
```
Markup: bottom bar with `role="region" aria-live="polite"`, dismiss button, link to `/fa/privacy`. CSS transition slide-up on first render. No focus trap.

**Files**: `src/components/legal/CookieNotice.tsx`, `src/app/[locale]/layout.tsx`. **Test**: `tests/phase-2/10-cookie-notice.spec.ts` — visible on first load; dismissing persists; reload keeps it hidden.
**Risk**: Low.

### LEGAL-04 — Consent checkbox + capture
1. **Schema** (additive):
    ```prisma
    model Evaluation {
      ...
      consentAcceptedAt   DateTime?
      consentTermsVersion Int?
      consentIp           String?
      consentUserAgent    String?
      marketingConsent    Boolean?
    }
    model ContactRequest {
      ...same...
    }
    ```
2. **API** `/api/evaluation` and `/api/contact` — zod-validate the consent fields, capture IP from `x-forwarded-for`/`x-real-ip` (already set by nginx, see Phase-1 nginx.conf) and `user-agent` from request headers.
3. **Forms** — add required checkbox + optional marketing checkbox to `EvaluationWizard` (last step) and the contact form. Disable submit until required checkbox is true.
4. **Migration**: `prisma/migrations/<ts>_add_consent_fields/migration.sql`, additive.

**Files**: `prisma/schema.prisma`, `prisma/migrations/...`, `src/components/EvaluationWizard.tsx`, `src/components/ContactForm.tsx`, `src/app/api/evaluation/route.ts`, `src/app/api/contact/route.ts`.
**Test**: `tests/phase-2/11-form-consent.spec.ts`. **Risk**: Medium — DB migration + form behavior change.

### LEGAL-05 — Footer disclosure line
Single line addition in `src/components/Footer.tsx`:
> «آلمانیار یک منبع اطلاع‌رسانی مستقل است و وابسته به هیچ نهاد رسمی نیست.»

**Files**: `src/components/Footer.tsx`. **Test**: extends `tests/phase-1/05-layout.spec.ts` assertion (still byte-identical across pages, with the new line included).
**Risk**: Nil.

### POSITIONING-01 — `/fa/how-it-works`
New page with the four-step model from the spec, rendered using existing `PageHero` + topic-route body shell. Content in `src/lib/positioning-content.ts`. Add to `PRIMARY_NAV` as `{ dictKey: 'howItWorks', path: '/how-it-works' }` and to the homepage trust section CTA.
Dictionary key `dict.nav.howItWorks = 'نحوه کار ما'`.

**Files**: `src/app/[locale]/how-it-works/page.tsx`, `src/lib/positioning-content.ts`, `src/config/navigation.ts`, `src/locales/fa.ts`. **Test**: `tests/phase-2/12-how-it-works.spec.ts`.

### POSITIONING-02 — Homepage trust section
Add a `<TrustModel>` component placed between the cinematic hero and Services. Four bullets + the "نحوه کار ما را ببینید →" link. Pure presentational; no business logic.

**Files**: `src/components/TrustModel.tsx`, `src/components/HomeClient.tsx`. **Test**: `tests/phase-2/13-trust-section.spec.ts`.

### POSITIONING-03 — Misleading-guarantee audit
**Already mostly clean.** Findings from my grep against `src/`:

| File:Line | Match context | Verdict |
|---|---|---|
| `src/app/[locale]/germany-visa-from-turkey/page.tsx:149` | "اقامت ترکیه شرط مهمی است، اما به‌تنهایی **تضمین‌کننده** پذیرش پرونده نیست." | **Keep** — negative usage ("is NOT a guarantor"). Defensible. |
| `src/lib/topic-content/types.ts:9` | Comment instructing authors NOT to use "تضمینی" | **Keep** — internal authoring guideline. |
| `src/lib/topic-content/jobs.ts:199` | "این ارقام راهنما هستند نه **تضمین**." | **Keep** — explicit "not a guarantee" disclaimer about salary ranges. |
| `src/lib/topic-content/visa-services.ts:53` | "ما هرگز موفقیت صددرصد یا **تضمین** صدور ویزا نمی‌دهیم… آنچه **تضمین** می‌کنیم این است که پرونده شما با دقت، صداقت و بهترین آمادگی ممکن ارائه خواهد شد." | **Soften second occurrence** → replace "تضمین می‌کنیم" with "تعهد می‌دهیم". First occurrence ("نمی‌دهیم") stays — it's a refusal. |
| `src/lib/topic-content/visa-services.ts:84-85` | Q: "آیا آلمانیار صدور ویزا را **تضمین** می‌کند؟" → A: "خیر. هیچ مشاور… آلمانیار **تضمین** می‌کند که پرونده شما با بهترین آمادگی ممکن ارائه شود." | **Soften final occurrence** → "آلمانیار **تعهد می‌دهد** که پرونده شما…". |
| `src/lib/topic-content/study.ts:595` | "با **تیم ما** مشورت کنید." | **Soften** → "با **ما** مشورت کنید." (single consultant) |

**No matches for**: "حتماً" / "قطعاً" / "صد در صد" / "100%" / "guaranteed" anywhere in content. (Each was greped separately.)
**No `Organization`-style "شرکت" or "تیم" references** to Almanyar itself. The 30+ `شرکت` matches are all about German employer companies in `jobs.ts`/`study.ts` — legitimate references to actual GmbH/Mittelstand firms.

Total edits: 3 sentence-level rewrites across 2 files. Bundled into a single commit.

**Files**: `src/lib/topic-content/visa-services.ts` (2 edits), `src/lib/topic-content/study.ts` (1 edit). **Test**: `tests/phase-2/14-guarantee-audit.spec.ts` — `grep -E '(تضمین|guaranteed|قطعاً|حتماً|۱۰۰٪|100%)' src/lib/topic-content src/app/[locale]` produces no NEW (post-edit) misleading uses, only the kept defensive ones.

---

## 4. Order of execution

Following the spec's suggested order, with one tweak — I'll fold SEO-01 into a single test rather than a separate task:

1. **POSITIONING-03 — content audit + soften** (anchors honest copy before anything else writes new content). Commit 1.
2. **SEO-05 — robots.txt staging gate**. Commit 2.
3. **SEO-04 — sitemap.xml + site-routes registry**. Commit 3.
4. **SEO-06 — `updatedAt` plumbing + Jalali display**. Commit 4.
5. **SEO-07 — visa hub split**. Commit 5.
6. **SEO-02 — hreflang `translatedLocales` forward-compat**. Commit 6.
7. **POSITIONING-01 — `/fa/how-it-works`**. Commit 7.
8. **POSITIONING-02 — homepage trust section**. Commit 8.
9. **LEGAL-01 — `/fa/disclaimer`**. Commit 9.
10. **LEGAL-02 — `/fa/privacy`**. Commit 10.
11. **LEGAL-05 — footer disclosure line**. Commit 11 (tiny).
12. **SEO-03 — JSON-LD overhaul (Person + 3 Services + WebSite + per-page wiring)**. Commit 12.
13. **LEGAL-03 — cookie notice**. Commit 13.
14. **LEGAL-04 — consent fields + migration + form wire-up**. Commit 14.
15. **SEO-01 verification test** + **PHASE-2-REPORT.md**. Commit 15.

Each commit ends green-tested. None requires a DB migration except #14 (additive, safe).

---

## 5. Open decisions — please ack

| # | Question | My default | If you'd rather |
|---|---|---|---|
| **A** | Spec says `Person.email` is not required but my default would include it. Include `info@almanyar.com` in `personLd`? | **Yes, include** | Reply "no email in Person" |
| **B** | `Person.image` — use `/logo.png` (the brand mark) or skip until you have a real headshot? | **Use logo.png** (better than nothing for AI/Google entity understanding) | Reply "skip image" |
| **C** | Article `dateModified` for topic pages where I don't have authoring history — fallback to `2026-05-22` (Phase-1 SEO content fill date)? | **Yes** — uniform date is fine for first publish | Reply "use file-level git lastmod via a build script" |
| **D** | Staging env var — `NEXT_PUBLIC_ENV !== 'production'` or `process.env.VERCEL_ENV` or another? You're on Hetzner, not Vercel. Suggest `NEXT_PUBLIC_ENV` set from `.env`. | **`NEXT_PUBLIC_ENV`** | Reply with the var name you prefer |
| **E** | Privacy page contact email — spec marks it as a TODO. Use `info@almanyar.com` (the public address already in `SITE.email`) or a separate `privacy@`? | **Use `info@almanyar.com`** | Reply with the email you want listed |
| **F** | Consent terms version — start at `1`. When you change disclaimer/privacy in the future, bump it manually in `src/lib/legal-content.ts`? | **Yes, manual bump** | Reply if you want auto-version from file hash |
| **G** | `marketingConsent` second checkbox — the spec says "OPTIONAL". I'll ship the form with it visible-but-unchecked. Confirm? | **Yes** | Reply if you'd rather hide it entirely Phase-2 |
| **H** | Cookie notice — should it auto-dismiss on any in-site navigation (one-click → fades on next route change) or stay until the button is clicked? | **Stay until button click** (clearer consent signal) | Reply "auto-dismiss" |

---

## 6. TODO placeholders the spec defers to you

These will land in the report (PHASE-2-REPORT.md) with `[TODO]` markers in code/content so they're searchable later:

1. **Privacy page contact email** — defaults to `info@almanyar.com` (open question E above).
2. **Exact settlement service list** for `settlementServiceLd.description` — the spec lists 6 items; I'll use those. If you want more granular phrasing, ack.
3. **`Person.sameAs[]`** — currently `[]` (the existing `SITE.social` includes IG + Telegram URLs but they're placeholders). I'll wire `SITE.social` in unless you confirm those handles aren't real. Default: pass through `SITE.social`.

---

## 7. Tests added (12 specs, all in `tests/phase-2/`)

```
01-no-keywords.spec.ts          — crawl sitemap, assert 0 keywords tags
02-hreflang.spec.ts             — fa + x-default present, no stray tr/en
03-jsonld.spec.ts               — Person/WebSite/Service/Article/FAQ shapes
04-sitemap.spec.ts              — every /fa/* URL present, xhtml:link present
05-robots.spec.ts               — prod allows public, disallows auth/admin
06-last-updated.spec.ts         — Jalali date visible + matches Article LD
07-visa-hub.spec.ts             — hub vs /what-is split works
08-disclaimer.spec.ts           — required phrases + link to how-it-works
09-privacy.spec.ts              — required phrases + email TODO surfaced
10-cookie-notice.spec.ts        — appears, dismisses, persists
11-form-consent.spec.ts         — eval + contact forms gated by checkbox
12-how-it-works.spec.ts         — page renders + 4 steps + final CTA
13-trust-section.spec.ts        — homepage trust bullets visible
14-guarantee-audit.spec.ts      — no NEW "تضمین" outside the defensive uses
```

Plus all Phase-1 tests must stay green (37/37); they will be re-run after each Phase-2 commit.

---

## 8. Rollback strategy

| Layer | Rollback |
|---|---|
| Code | One commit per task; `git revert <sha>` reverts cleanly. Each commit is self-contained (no shared state). |
| JSON-LD swap (commit 12) | The biggest blast radius. Old Organization-shaped LD continues to validate; if rolled back, callers that point at `@id: '/#person'` need a follow-up. I'll keep both `organizationLd` and `personLd` exported in `lib/seo.ts` until commit 12 is verified live, then delete `organizationLd` in a follow-up commit. |
| Sitemap registry | If something's wrong, `git revert` restores the Phase-1 hand-curated list. No URL goes away — only the alternate-language tag changes. |
| Consent migration (commit 14) | Forward-only Prisma migration but additive (new nullable columns). Rollback: `ALTER TABLE Evaluation DROP COLUMN consent…` and `prisma migrate resolve --rolled-back`. Form behavior reverts via `git revert`. |
| Cookie notice | Pure additive component; revert removes the bar. No data implication (only localStorage). |
| Visa hub split | One-line in `germany-topics.ts` + one redirect rule. Trivial revert. |

---

## 9. What I need from you before code starts

1. Ack on decisions **A–H** in §5 (or override individually).
2. Resolve the TODO placeholders in §6 — most importantly the privacy email (E).
3. Confirm the **execution order** in §4 (or reorder).
4. Say "go" and I start with **POSITIONING-03 (audit + soften)**.
