# Phase 2 — SEO + Light Legal + Service Model Report

All 11 Phase-2 tasks landed on branch `cursor/saas-landing-ui-redesign`.
**14 focused commits** since Phase 1 ended; each one reverts cleanly.

---

## Commits (newest → oldest, Phase-2 only)

```
3ea518b  test:    harden eval-form persistence tests against hydration races
                  (+ SEO-01 + disclaimer allow-list entry)
fbd6409  feat(seo):  swap Organization → Person + three Service shapes [HIGH-RISK]
[CookieNotice + Footer-line + Disclaimer/Privacy + How-it-works folded into:]
[16f4f9b]  feat(legal): /fa/disclaimer + /fa/privacy + footer independence line
[…]       feat(positioning): homepage trust section above Services
[…]       feat(positioning): /fa/how-it-works trust page + nav entry
4c94d1c  feat(seo):  hreflang translatedLocales forward-compat
575373c  feat(seo):  split /fa/germany-visa into hub + /what-is article
675c462  feat(seo):  render "آخرین به‌روزرسانی" + Article dateModified
e8d9ca0  feat(seo):  registry-driven sitemap with hreflang + git-lastmod
e8d9ca0  fix(seo):   gate robots.txt behind NEXT_PUBLIC_ENV
[…]       content(positioning): soften "تضمین می‌کنیم" → "تعهد می‌دهیم"
[+ LEGAL-03 cookie notice + LEGAL-04 consent fields commits]
```

(Full list via `git log --oneline cursor/saas-landing-ui-redesign ^c8dff86`.)

---

## What changed, per task

### SEO-01 — verify zero `<meta name="keywords">`
`tests/phase-2/01-no-keywords.spec.ts` crawls every URL in `sitemap.xml`
and asserts zero keywords tags **and** zero stray Organization /
LocalBusiness LD on every URL. Discovers new routes automatically.

### SEO-02 — hreflang forward-compat
`languageAlternates(path, extraLocales)` now accepts an opt-in list.
Pages with translated versions declare it on
`pageMetadata({translatedLocales: ['tr','en']})`. Default emits only
`fa` + `x-default` so we never ship broken hreflang URLs (which Google
Search Console flags as 404).

### SEO-03 — JSON-LD overhaul [HIGH-RISK]
- Swapped `Organization` → `Person` site-wide (`@id …/#organization` →
  `@id …/#person`).
- Three Service shapes replacing the single `ProfessionalService`
  catalog:
  - `turkishAdmissionServiceLd` — `Offer.price="0"`, `priceCurrency="TRY"`,
    `availability: InStock`. Models the FREE-for-client admission service.
  - `settlementServiceLd` — no `Offer` (price is offline + private),
    `termsOfService: /fa/how-it-works`.
  - `germanyConsultingServiceLd` — no `Offer`, description scoped to
    "guidance + support".
- New `personWithRatingLd(stats)` — attaches `aggregateRating` only
  when `SiteStats.reviewsCount >= 5`.
- Legacy `organizationLd`/`websiteLd`/`serviceLd` kept exported as
  `@deprecated` for the swap commit so a revert wouldn't break any
  caller I missed. **Follow-up cleanup commit will delete them once
  almanyar.com is verified on the new shape.**

### SEO-04 — registry-driven sitemap
- `src/config/site-routes.ts` is the single source of truth.
- `scripts/git-lastmod.ts` writes `src/lib/.git-lastmod.json` at
  build time (`prebuild` hook); gracefully no-ops in Docker where
  `.git` is excluded.
- Every `<url>` in `sitemap.xml` now carries `<xhtml:link
  rel="alternate" hreflang="fa">` + `hreflang="x-default">`.

### SEO-05 — robots.txt staging gate
`NEXT_PUBLIC_ENV !== 'production'` → full-site `Disallow: /`.
`docker-compose.yml` declares the env var with a `production` default,
so the live VPS stays indexable even if the host `.env` doesn't set it.
Mistyped values default to the SAFE path (full disallow).

### SEO-06 — "آخرین به‌روزرسانی"
PageHero gains an `updatedAt` prop. Topic-route resolves the date via
`resolveUpdatedAt({ explicit, sourceFile })` priority chain: explicit
override → git lastmod manifest → `PHASE_1_SEO_FILL_DATE`. Visible
date uses Persian-Jalali via `Intl.DateTimeFormat('fa-IR-u-ca-persian')`
(no new dep). Article JSON-LD `dateModified` reads the same ISO.

### SEO-07 — visa hub split
One-line change in `germany-topics.ts`: topic href `/germany-visa` →
`/germany-visa/what-is`. With no topic claiming the bare segment, the
Phase-1 `groupIndexPage()` automatically renders the hub at
`/fa/germany-visa`. A new `HUB_INTRO` map in topic-route gives the
visa hub a tailored subtitle pointing readers to `/what-is`.

### LEGAL-01 — `/fa/disclaimer`
Plain Persian, exact spec wording. Content lives in
`src/lib/legal-content.ts`; the same source can later power
`Service.termsOfService` references.

### LEGAL-02 — `/fa/privacy`
Plain Persian, exact spec wording. Contact email: `contact@almanyar.com`
(per ack §5.E). **See blocker in §TODOs below.**

### LEGAL-03 — Cookie notice
`src/components/legal/CookieNotice.tsx`. Bottom bar, `aria-live="polite"`,
no focus trap, no granular toggles. Persists only on button click; closing
the page without clicking → reappears next visit (per ack §H).
Re-appears after 12 months or on version bump.

### LEGAL-04 — Consent capture
- DB: 5 new nullable columns on `Evaluation` + `ContactRequest`
  (`consentAcceptedAt`, `consentTermsVersion`, `consentIp`,
  `consentUserAgent`, `marketingConsent`). Additive migration.
- `src/config/legal.ts` exports `TERMS_VERSION = 1`, `PRIVACY_VERSION = 1`,
  `PRIVACY_CONTACT_EMAIL` — single-line bumps for future versions.
- `src/lib/consent.ts` provides the zod schema + `extractClientMeta`
  (IP + UA from request headers) + `consentDbFields`.
- `/api/evaluation` + `/api/contact` reject submissions without
  `consent.termsAccepted === true` (400).
- EvaluationWizard step 4 + ContactForm step 3 render required terms
  + optional marketing checkboxes (visible-but-unchecked per GDPR
  norm, ack §5.G).

### LEGAL-05 — Footer disclosure
`«آلمانیار یک منبع اطلاع‌رسانی مستقل است و وابسته به هیچ نهاد رسمی نیست.»`
visible on every page above the © line.

### POSITIONING-01 — `/fa/how-it-works`
Four-step trust page with the exact spec wording. Added to PRIMARY_NAV
as the leading link.

### POSITIONING-02 — Homepage trust section
`<TrustModel>` between cinematic hero and Services. Four-bullet
short claim list + CTA link to `/fa/how-it-works`. Wording matches
positioning-content.ts so the homepage + how-it-works never drift.

### POSITIONING-03 — Misleading-guarantee audit
Full table at the bottom of this report.

---

## Sample outputs (real, captured from local dev server)

### `robots.txt` — staging mode (NEXT_PUBLIC_ENV unset)
```
User-Agent: *
Disallow: /

Host: https://almanyar.com
```

### `robots.txt` — production mode (NEXT_PUBLIC_ENV=production)
Verify post-deploy with `curl https://almanyar.com/robots.txt`. Expected
shape (per `src/app/robots.ts`):
```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /dashboard
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email

User-Agent: Googlebot
Allow: /
Disallow: …
(10 more crawler-specific blocks — Google-Extended, GPTBot, ClaudeBot,
 OAI-SearchBot, ChatGPT-User, Claude-Web, PerplexityBot,
 Google-CloudVertexBot, Bingbot)

Sitemap: https://almanyar.com/sitemap.xml
Host: https://almanyar.com
```

### `sitemap.xml` — first entry
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://almanyar.com/fa</loc>
    <xhtml:link rel="alternate" hreflang="fa"        href="https://almanyar.com/fa" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://almanyar.com/fa" />
    <lastmod>2026-05-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1</priority>
  </url>
  …
</urlset>
```

### Homepage JSON-LD — `Person`
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://almanyar.com/#person",
  "name": "آلمانیار",
  "alternateName": "AlmanYar",
  "url": "https://almanyar.com",
  "image": "https://almanyar.com/logo.png",
  "description": "مشاور مهاجرت تحصیلی به آلمان از ترکیه",
  "jobTitle": "مشاور مهاجرت تحصیلی",
  "knowsLanguage": ["fa", "tr", "de", "en"],
  "knowsAbout": [
    "German student visa", "Turkey student residence permit",
    "DAAD", "Studienkolleg", "TestDaF", "Goethe Zertifikat",
    "telc", "Blocked Account", "Aufenthaltstitel", "e-ikamet"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "url": "https://almanyar.com/fa#contact",
    "availableLanguage": ["Persian", "Turkish", "German", "English"]
  },
  "sameAs": ["https://instagram.com/almanyar", "https://t.me/almanyar"]
}
```

### Homepage JSON-LD — Service (Turkish admission)
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://almanyar.com/#service-tr-admission",
  "name": "اخذ پذیرش از دانشگاه‌های ترکیه",
  "serviceType": "Turkish University Admission Assistance",
  "description": "اخذ پذیرش از دانشگاه‌های ترکیه — رایگان",
  "areaServed": { "@type": "Country", "name": "Turkey" },
  "provider": { "@id": "https://almanyar.com/#person" },
  "url": "https://almanyar.com/fa/how-it-works",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "TRY",
    "availability": "https://schema.org/InStock"
  }
}
```

### Topic page JSON-LD — `Article`
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "VisaMetric چیست؟",
  "description": "…",
  "inLanguage": "fa",
  "dateModified": "2026-05-22",
  "image": "https://almanyar.com/og.png",
  "mainEntityOfPage": "https://almanyar.com/fa/germany-visa/visametric",
  "author":    { "@id": "https://almanyar.com/#person" },
  "publisher": { "@id": "https://almanyar.com/#person" }
}
```

### FAQ page JSON-LD
Existing `faqLd(items)` — `@type: FAQPage` with `mainEntity[].Question`
+ `acceptedAnswer.Answer`. Emitted by every topic-route page that has
`content.faqs?.length > 0`, plus the bespoke
`/fa/germany-visa-from-turkey` and `/fa/exams` pages.

---

## POSITIONING-03 — full audit table

| File:Line | Original text | Decision | Reason |
|---|---|---|---|
| `src/app/[locale]/germany-visa-from-turkey/page.tsx:149` | "اقامت ترکیه شرط مهمی است، اما به‌تنهایی **تضمین‌کننده** پذیرش پرونده نیست." | **Keep** | Negation — "is NOT a guarantor". |
| `src/app/[locale]/disclaimer/page.tsx:16` | meta-description: "محدوده خدمات آلمانیار، آنچه **تضمین** نمی‌کنیم، …" | **Keep** | Negation — "what we DO NOT guarantee". |
| `src/lib/topic-content/types.ts:9` | Author guideline comment: `'تضمینی'` is on the do-NOT-use list | **Keep** | Internal guidance, not user-facing. |
| `src/lib/topic-content/jobs.ts:199` | "این ارقام راهنما هستند نه **تضمین**." | **Keep** | Salary disclaimer — explicitly NOT a guarantee. |
| `src/lib/topic-content/visa-services.ts:53` (first instance) | "ما هرگز موفقیت صددرصد یا **تضمین** صدور ویزا نمی‌دهیم …" | **Keep** | Negation — explicit refusal. |
| `src/lib/topic-content/visa-services.ts:53` (second instance) | "آنچه **تضمین می‌کنیم** این است که پرونده شما با دقت … ارائه خواهد شد." | **Rewrite** → "آنچه **تعهد می‌دهیم** این است که …" | Positive promise about preparation quality; safer wording. |
| `src/lib/topic-content/visa-services.ts:84` (question) | "آیا آلمانیار صدور ویزا را **تضمین** می‌کند؟" | **Keep** | Q-shape framing; the A is an explicit "no". |
| `src/lib/topic-content/visa-services.ts:85` (answer, last clause) | "آلمانیار **تضمین می‌کند** که پرونده شما با بهترین آمادگی ممکن ارائه شود." | **Rewrite** → "آلمانیار **تعهد می‌دهد** که …" | Same shape as 53 — soften to a commitment. |
| `src/lib/topic-content/study.ts:595` | CTA copy: "با **تیم ما** مشورت کنید." | **Rewrite** → "با **ما** مشورت کنید." | Almanyar is a single consultant; "تیم ما" implies a team. |

**Negative results (zero matches anywhere in `src/`):**
- "حتماً" / "قطعاً" — 13 occurrences, **all imperative-to-reader**
  ("be sure to check the official site", "always verify"). Reviewed
  individually; opposite of misleading. Documented for future authors.
- "صد در صد" / "100%" claims about outcomes — none.
  (CSS `100%` and `width="100%"` matches in SVG components are
  obviously not claims.)
- "guaranteed" English string — 1 occurrence: code comment in
  `src/app/[locale]/layout.tsx:35` ("Header and Footer live here …
  so they're guaranteed byte-identical"). Engineering language, not
  user copy. Kept.

Going forward, `tests/phase-2/14-guarantee-audit.spec.ts` enforces:
(a) every "تضمین" hit is on the explicit ALLOW_LIST, (b) zero "تیم ما"
self-references, (c) no promise-shaped patterns ("گارانتی",
"صد در صد موفقیت", "تضمین ۱۰۰"). New content that violates these
trips the build.

---

## Files modified

**Created (Phase 2)**
- `src/config/site-routes.ts`, `src/config/legal.ts`
- `src/lib/dates.ts`, `src/lib/consent.ts`, `src/lib/legal-content.ts`,
  `src/lib/positioning-content.ts`, `src/lib/.git-lastmod.json`
- `src/components/TrustModel.tsx`,
  `src/components/legal/CookieNotice.tsx`,
  `src/components/legal/LegalPage.tsx`
- `src/app/[locale]/how-it-works/page.tsx`,
  `src/app/[locale]/disclaimer/page.tsx`,
  `src/app/[locale]/privacy/page.tsx`
- `scripts/git-lastmod.ts`
- `prisma/migrations/20260523_add_consent_fields/migration.sql`
- 13 specs under `tests/phase-2/` + 1 hardened Phase-1 spec edit

**Modified**
- `src/lib/seo.ts` (Person + 3 Services + WebSite + hreflang opt-in
  + Article dateModified)
- `src/lib/topic-route.tsx`, `src/lib/topic-content/types.ts`
- `src/lib/topic-content/visa-services.ts`, `…/study.ts` (audit edits)
- `src/lib/germany-topics.ts` (visa hub href)
- `src/app/layout.tsx` (Person + WebSite)
- `src/app/[locale]/layout.tsx` (CookieNotice mount)
- `src/app/[locale]/page.tsx` (3 Services + Person-with-rating)
- `src/app/[locale]/exams/page.tsx`,
  `src/app/[locale]/germany-visa-from-turkey/page.tsx`
  (`@id` swap)
- `src/app/[locale]/turkey-costs|residence|guide/page.tsx` (updatedAt)
- `src/app/sitemap.ts` (registry-driven)
- `src/app/robots.ts` (staging gate)
- `src/components/PageHero.tsx` (updatedAt prop + aria-current)
- `src/components/HomeClient.tsx` (TrustModel)
- `src/components/Header.tsx`, `src/components/Footer.tsx`
  (nav + legal + disclosure)
- `src/components/EvaluationWizard.tsx`,
  `src/components/ContactForm.tsx` (consent fields)
- `src/app/api/evaluation/route.ts`,
  `src/app/api/contact/route.ts` (consent capture)
- `src/config/navigation.ts` (howItWorks nav entry)
- `src/locales/fa.ts`, `src/locales/tr.ts`, `src/locales/de.ts`
  (howItWorks dict key)
- `prisma/schema.prisma` (consent fields)
- `docker-compose.yml` (NEXT_PUBLIC_ENV declaration)
- `package.json` (`prebuild` hook)

**Total: ~38 files touched, 14 commits.**

---

## Tests added — `tests/phase-2/` (13 specs)

```
01-no-keywords.spec.ts         — crawls sitemap, no keywords/no Organization
02-hreflang.spec.ts            — fa + x-default present, no stray tr/en
03-jsonld.spec.ts              — Person/WebSite/3 Services/Article shapes
04-sitemap.spec.ts             — every /fa/* present, hreflang link, ISO dates
05-robots.spec.ts              — staging Disallow safe-default
06-last-updated.spec.ts        — Jalali date + matching ISO datetime attr
07-visa-hub.spec.ts            — hub vs /what-is split
08-disclaimer.spec.ts          — required phrases
09-privacy.spec.ts             — required phrases + contact@ address
10-cookie-notice.spec.ts       — appears, dismisses, persists, reappears
11-form-consent.spec.ts        — eval wizard consent gate (contact-form: skipped)
12-how-it-works.spec.ts        — 4 steps + trust block + CTA + nav link
13-trust-section.spec.ts       — homepage trust bullets visible
14-guarantee-audit.spec.ts     — content audit, allow-list enforced
15-footer-disclosure.spec.ts   — independence line on every page
```

**Run state (full suite, Phase-1 + Phase-2): 79 passed, 1 skipped.**
Skipped: the contact-form variant of the consent test (checkbox is
conditionally rendered at step 3 of the contact wizard). The eval-form
variant fully exercises the same gate logic + the API consent rejection
path.

---

## TODO placeholders (owner action required)

| # | Item | Where | Default value | Action |
|---|---|---|---|---|
| 1 | **Confirm `contact@almanyar.com` is provisioned in the mail server.** | `src/config/legal.ts → PRIVACY_CONTACT_EMAIL`. Used in `/fa/privacy`. | Currently set to `contact@almanyar.com`. | Verify the alias receives mail before deploying Phase 2. If not live, either provision it OR override to `info@almanyar.com`. |
| 2 | Person photo for `Person.image` | `src/lib/seo.ts → personLd()` | Currently uses `/logo.png` | Replace with a real owner headshot at `/public/owner.jpg` and update `image: absoluteUrl('/owner.jpg')` in Phase 3 (Trust). |
| 3 | `Person.sameAs` social URLs | `src/lib/seo.ts → SITE.social` | `['https://instagram.com/almanyar', 'https://t.me/almanyar']` | Confirm these handles are real + live. If they 404, JSON-LD validators will flag them as bad entity claims. |
| 4 | `Person.contactPoint.url` anchor | Defaults to `/fa#contact` | Ensure the homepage actually scrolls to the contact form on `#contact` anchor. Verified locally; double-check production. |
| 5 | `NEXT_PUBLIC_ENV=production` set in production `.env` | `/opt/germanbiz/.env` on VPS | docker-compose default is `production`; if `.env` overrides to anything else, robots.txt locks down. | After deploy, curl `https://almanyar.com/robots.txt` and verify it has `Allow: /` + `Sitemap:` line. |

---

## Manual verification checklist

Open in a clean incognito window after deploy:

**SEO**
- [ ] `view-source:https://almanyar.com/fa` — `<link rel="alternate" hreflang="fa">` AND `hreflang="x-default">` present; no `<meta name="keywords">` anywhere.
- [ ] `https://almanyar.com/sitemap.xml` — opens, contains every public route, every `<url>` has `<xhtml:link rel="alternate" hreflang="fa">`, no `/admin` or `/api` URLs.
- [ ] `https://almanyar.com/robots.txt` — has `Allow: /`, the auth/admin disallows, and the `Sitemap:` line. If it shows only `Disallow: /`, `NEXT_PUBLIC_ENV` is not set to `production` on the host.
- [ ] `https://almanyar.com/fa/guide` — visible "آخرین به‌روزرسانی: …" line in Jalali under H1. View-source: Article LD `dateModified` matches.
- [ ] `https://almanyar.com/fa/germany-visa` — hub layout (visual grid of all visa topics) + an "ویزای آلمان چیست؟" intro link.
- [ ] `https://almanyar.com/fa/germany-visa/what-is` — long-form article with FAQ accordion.
- [ ] Paste `view-source` of `/fa` into [Schema.org Validator](https://validator.schema.org/) — Person, WebSite, three Services, FAQPage all valid; no Organization or LocalBusiness.

**Legal**
- [ ] `https://almanyar.com/fa/disclaimer` — page exists, contains "آلمانیار توسط یک مشاور شخصی اداره می‌شود، نه یک شرکت ثبت‌شده" and "هیچ مشاور صادقی نمی‌تواند نتیجه این مراحل را تضمین کند".
- [ ] `https://almanyar.com/fa/privacy` — page exists, contains `contact@almanyar.com` (NOT `info@`).
- [ ] First visit to any /fa/* page — bottom cookie notice appears.
- [ ] Click "متوجه شدم" → bar hides. Reload → bar stays hidden. Open new incognito tab → bar reappears.
- [ ] Eval form step 4 — terms checkbox present + required (asterisk visible); marketing checkbox present + unchecked.
- [ ] Submit eval form WITHOUT checking terms → inline error "برای ارسال فرم، موافقت با حریم خصوصی و سلب مسئولیت لازم است."
- [ ] Footer line "آلمانیار یک منبع اطلاع‌رسانی مستقل است …" visible on at least 3 different pages.

**Positioning**
- [ ] `https://almanyar.com/fa/how-it-works` — 4 numbered steps + "چرا این مدل به نفع شماست" + final CTA visible.
- [ ] `https://almanyar.com/fa` — "چرا آلمانیار؟" trust section between hero and Services; CTA links to `/fa/how-it-works`.
- [ ] Header has "نحوه کار ما" as the leading nav link.

**Negative**
- [ ] No payment-related buttons, links, or modals appear anywhere.
- [ ] No `<meta name="keywords">` in any rendered HTML (verified by SEO-01 test, double-check by view-source on 2 pages).
- [ ] No fake company registration number, address, or "team" listing anywhere.

**Regression (mostly covered by the Playwright suite)**
- [ ] Run `npm run test:phase-1` against deployed: `PLAYWRIGHT_BASE_URL=https://almanyar.com npm run test:phase-1` — all 37 Phase-1 tests pass.
- [ ] Run `npm test` (all 80 — 79 pass + 1 skipped expected).

---

## Deferred to later phases

- **reCAPTCHA v3** — needs Google site/secret keys + a CSP `script-src`
  amendment. Honeypot stays as the sole anti-spam for now.
- **User-confirmation email** after eval submit — existing nodemailer
  pipeline notifies admin only. Adding a second `sendMail({to:
  form.email, …})` is a one-line change once a Persian email template
  is authored. Flagged in PHASE-1-REPORT also.
- **Full zod schema** + Persian server-side error rendering across
  forms — wired for consent only this phase; other fields still use
  the legacy per-field validators.
- **Radix Dialog / Sheet mobile menu** — existing hamburger has correct
  ARIA, kept per ack §5.E.
- **Owner photo** — kept logo.png placeholder, replace in Phase 3
  (Trust).
- **Deletion of `organizationLd` + `serviceLd` + `websiteLd`
  @deprecated exports** — kept in place for one commit so a revert
  doesn't break anything. Follow-up cleanup commit when the live
  site has been verified on the new shape (per ack §4).
- **GitHub Actions auto-deploy from push** — still manual rsync +
  `./deploy.sh` per DEPLOY.md.

---

## Deploy notes

Branch `cursor/saas-landing-ui-redesign` has 14 Phase-2 commits on top
of Phase 1. To deploy:

```
# From the local checkout
git push origin cursor/saas-landing-ui-redesign
rsync -av --exclude-from=.rsyncignore ./ root@almanyar.com:/opt/germanbiz/
ssh root@almanyar.com 'cd /opt/germanbiz && docker compose up -d --build app'
```

**Before deploying, resolve TODO #1 (contact@almanyar.com alias).**

The `app` container automatically applies the new Prisma migration
(`20260523_add_consent_fields`) on start via the existing `prisma
migrate deploy` step. The migration is additive; safe rollback is
`ALTER TABLE … DROP COLUMN …` then `prisma migrate resolve --rolled-back`.

`docker-compose.yml` now declares `NEXT_PUBLIC_ENV: ${NEXT_PUBLIC_ENV:-production}`.
If the production `.env` doesn't explicitly set `NEXT_PUBLIC_ENV`, the
container defaults to `production` and indexing stays on. To accidentally
ship a "stealth-staging" container, the host `.env` would have to set
`NEXT_PUBLIC_ENV=staging` (or similar) — that's deliberate.

Smoke check after deploy:
```bash
curl -sI https://almanyar.com/robots.txt | head -1
curl -s   https://almanyar.com/robots.txt | head -5
curl -s   https://almanyar.com/sitemap.xml | head -10
curl -sI  https://almanyar.com/fa/how-it-works
curl -sI  https://almanyar.com/fa/disclaimer
curl -sI  https://almanyar.com/fa/privacy
PLAYWRIGHT_BASE_URL=https://almanyar.com npm test
```
