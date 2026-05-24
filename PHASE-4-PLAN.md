# Phase 4 — Content Audit + Admin Notifications + Marketing Opt-in + Universities Marquee

> Read-only audit done; no production code touched yet.
> Approve this plan before I write anything.

---

## 1. Persian copy audit — findings

I scanned every visible Persian string on the homepage + cinematic hero + dictionary. The site is in **very good shape**; only one structural issue and a few subjective phrasing improvements:

### Structural bug (must fix)
| File:Line | Current | Should be | Why |
|---|---|---|---|
| `src/components/journey/CinematicJourneyHero.tsx:352` | «**آلمان‌یار**، همراه هوشمند مسیر مهاجرت شما» | «**آلمانیار**، همراه هوشمند …» | A stray ZWNJ between «آلمان» and «یار». Brand is **always** «آلمانیار» (one word, no ZWNJ) across the rest of the codebase. This one line is inconsistent. |

### Searched for and did **not** find
- Arabic ك (kaf) instead of Persian ک — zero hits.
- Arabic ي (yeh) instead of Persian ی — zero hits.
- Stray leading/trailing ZWNJ — zero hits.
- Common misspellings: «اپلای / آپلای», «همراهی / همراهیی», «ایمیل / ایمل» — zero.
- Mixed digit systems: zero (all Persian numerals throughout content).

### Subjective copy-quality observations (decisions §5)
| Where | Current | My suggested rewrite | Why |
|---|---|---|---|
| Cinematic Flight scene subtitle | «میان ترس و امید، نخستین قدم را برمی‌داری.» | Keep as-is | Reads well; preserves cinematic register. |
| Cinematic Iran scene subtitle | «سفارت آلمان در تهران غیرقابل پیش‌بینی است. مسیر امن از ترکیه شروع می‌شود — ۶ ماه آماده‌سازی، اقامت دانشجویی، سفارت قابل دسترس.» | Soften «غیرقابل پیش‌بینی» to «بسیار محدود» if you want a less confrontational tone toward the embassy | Stylistic only; both are honest. |
| Cinematic Turkey scene title | «از تهران تا استانبول؛ از ابهام تا برنامه‌ریزی» | Keep as-is | Reads beautifully. |
| Cinematic AlmanYar reveal | «از نخستین تصمیم در تهران تا روز اول زندگی در آلمان، یک مسیر روشن، گام‌به‌گام و قابل اعتماد در کنار توست.» | Singular «در کنار توست» mixed with formal everywhere else — recommend «در کنار شماست» for register consistency | Phase-3 about page + footer + how-it-works all use formal «شما» voice. The cinematic still has the informal «تو» in places. Decision in §5. |
| TrustModel card 1 body | «سفارت آلمان در تهران **بسته است**.» | «سفارت آلمان در تهران **عملاً تعطیل** است.» | Factual edge: officially, Tehran embassy has a skeleton operation, not full closure. «عملاً تعطیل» is honest and less easy to disprove if someone fact-checks. Decision in §5. |
| Footer city | «استانبول، ترکیه» | Keep as-is | OK. |

Total proposed edits if you ack all stylistic changes: ~4 lines. The 1 structural fix lands regardless.

---

## 2. Cinematic hero — font + position

I inspected font wiring + caption placement:

**Font wiring (clean)**
- `src/app/layout.tsx` loads `Vazirmatn` from `next/font/google` with all weights, `display: swap`, exposed as `--font-vazir`.
- `<html className={vazirmatn.variable}>` and `<body className="persian-font">` apply the variable globally.
- `[locale]/layout.tsx` re-applies `persian-font` on the locale `<div>` — so even if a parent loses the class, the locale tree restores it.
- Cinematic captions inherit through this chain. **No font override or font-loss point identified.**

**Caption placement (what I see in the source)**
- `CaptionBlock` renders absolute-positioned inside the pinned stage with `top: 50%; transform: translateY(-50%)` — centered vertically.
- Captions are responsive: `text-3xl sm:text-4xl md:text-5xl` for the title, `text-base md:text-lg` for the subtitle.
- Max width: `max-w-2xl` for title, `max-w-xl` for subtitle.

**What I can't diagnose from source alone:** you said «جاشون و فونتشون شاید درست نباشه» — could mean (a) text feels too thin / too thick at a specific scene, (b) text is offset oddly inside the cinematic frame on your screen, (c) Vazirmatn loads but the Tahoma fallback flashes briefly (FOUT), (d) on mobile the caption gets clipped by the skyline SVG.

**My recommended approach in §3:**
1. Take fresh screenshots of all 5 cinematic scenes on the live site (desktop + mobile) and surface them to you.
2. Based on what you point to, do a targeted fix — most likely candidates would be:
   - Add `font-vazir` class explicitly on `.cj-caption-title` + `.cj-caption-sub` (defensive belt-and-suspenders).
   - Adjust caption vertical position from center to `top: 36%` so it doesn't compete with skyline SVGs at the bottom.
   - Drop the title weight from `font-extrabold` (800) to `font-bold` (700) — Vazirmatn renders 800 less crisply for Persian than 700.

This is **decision §5.E** — I'd rather see the screenshots with you than guess.

---

## 3. Admin notes → user email (new feature)

### Current state
- `ContactRequest`, `Evaluation`, `Application` all have an `adminNotes` field (text, max 5000) edited via `PATCH /api/admin/<table>/[id]`.
- The PATCH route just writes the column. **No notification fires.**
- The owner can see the lead's email on the same admin page.

### Proposed
The safest UX is an **explicit «ارسال یادداشت برای مشتری» button** on each admin page, separate from the «ذخیره یادداشت» save button. Reasons:
- Owner often saves intermediate notes that aren't ready to send.
- An auto-send-on-save would create accidental emails the customer can't unsee.
- Explicit button = explicit consent moment.

### Implementation
| Layer | Change |
|---|---|
| Schema | Add `lastNotifiedAt: DateTime?` to `ContactRequest`, `Evaluation`, `Application`. Additive nullable migration. Used to show «آخرین ارسال: ۲ روز پیش» in admin UI. |
| API | New endpoint `POST /api/admin/<table>/[id]/notify` — admin-guarded, takes `{ message?: string }`. If `message` is omitted, sends the current `adminNotes` value verbatim. Updates `lastNotifiedAt`. |
| Email | New template `notifyCustomer({ to, name, message, leadType })` in `src/lib/email-templates.ts`. Persian subject «به‌روزرسانی پرونده شما — آلمانیار»; body contains the admin's message + a footer disclaimer + reply-to=`contact@almanyar.com`. |
| Admin UI | Three admin pages get a small block under `adminNotes`:<br>«ارسال این یادداشت به مشتری» button +  «آخرین ارسال: …» line + (after click) a brief Persian success/error toast. |
| Audit | An entry in `AdminEmailLog` (new tiny table): `{ id, leadType, leadId, sentAt, subject, snippet, sentBy }` so we always have a record of what was sent and to whom. |

### Risk
- Medium. New DB column on three tables + new audit table; first feature on the site that sends an email to a customer (other than verification/forgot-password). Rate-limit: prevent >3 notifications/lead/day at the API layer.

---

## 4. Marketing email opt-in at registration

### Current state
- `User` model: `id, email, name, hashedPassword, role, emailVerified, image, createdAt, updatedAt` (+ relations).
- `/register` page: 4 inputs (name, email, password, confirm-password) + submit. No marketing checkbox.
- `/api/auth/register`: validates with zod, creates user, fires verification email. Returns 201.

### Proposed
| Layer | Change |
|---|---|
| Schema | Add `marketingConsent: Boolean @default(false)` and `marketingConsentAt: DateTime?` to `User`. Additive migration. Default false = explicit opt-in required (GDPR-safe). |
| Form | New checkbox at the bottom of `/register` form: «موافقم راهنماها و اطلاعات مفید را از طریق ایمیل دریافت کنم (اختیاری)». Same wording the Phase-2 LEGAL-04 contact form uses — single source of truth. Unchecked by default. |
| API | `/api/auth/register` zod schema gains `marketingConsent: z.boolean().optional()`. If `true`, set both columns at create time. |
| Welcome email | When `marketingConsent === true` at create time, send a Persian confirmation email separately from the verification email: «به فهرست خبرنامه آلمانیار خوش آمدید — این ایمیل تایید عضویت شماست. هر زمان می‌توانید لغو کنید.» with an unsubscribe link to `/api/marketing/unsubscribe?token=…`. |
| Unsubscribe | New tiny endpoint that flips `marketingConsent = false` based on a signed token (HMAC of `userId + secret`). Renders a minimal `/fa/unsubscribed` page after. |
| Admin | Add a column to `/admin` (users count: «۲۳ کاربر، ۱۲ مشترک خبرنامه») — visible only on the dashboard, not a separate page. |

### Risk
- Low. Additive schema, opt-in by default, unsubscribe token signed (no auth required to use, but tamper-proof).

---

## 5. Universities logo marquee (new homepage band)

### Spec
- A band of **logos only** (no text), positioned wherever I think reads best on the homepage.
- A scrolling marquee (نوار متحرک), continuous loop.
- Coverage: **all private universities** in Istanbul / Antalya / Ankara / Izmir that we can realistically place students in.

### Open issue I can't resolve alone — §5.A
- I should **not invent** a list of universities. Two safe paths:
  - **Path A** (faster, you confirm): I pre-fill the marquee with a starter list of ~25 well-known Turkish private universities in the 4 cities (e.g. İstanbul Medipol, Bahçeşehir, İstanbul Bilgi, Yeditepe, Koç, Sabancı, Özyeğin, Bilkent, Atılım, TED, İstanbul Aydın, Antalya Bilim, Yaşar, İzmir Ekonomi, Antalya AKEV — full list in the planning doc when you ack). You add/remove. Logos = a tasteful text-wordmark placeholder per university until you provide real SVGs.
  - **Path B** (more accurate, slower): you give me the list (CSV or just a chat message) before I commit anything.

### Position on the homepage — §5.B
My recommendation: **between the cinematic hero and the `TrustModel` "چرا آلمانیار؟" section.** Reasons:
- It immediately follows the headline, where trust signal lands hardest.
- It physically breaks up the page between dark cinematic chrome and light TrustModel cards — visually breathes.
- Sits above the fold on a typical laptop after one scroll.

Alternative placements: above the Services section (less impactful), or inside the AlmanYar reveal scene of the cinematic (would clutter the timeline).

### Implementation
| Layer | Change |
|---|---|
| Component | New `src/components/UniversityMarquee.tsx`. CSS-only `@keyframes` infinite scroll, duplicated logo array (the standard CSS marquee trick — no JS, no library). Pause on hover. Respects `prefers-reduced-motion` (becomes a static row). |
| Data | `src/config/universities.ts` — typed array `{ slug, name, city, logo: '/universities/<slug>.svg' }`. |
| Assets | `public/universities/` — placeholder SVG wordmarks per university (Path A), or your real logo files (Path B / later swap). |
| Heading | A small h2 above the marquee: «از دانشگاه‌های همکار ترکیه پذیرش می‌گیریم». **No claim of partnership** — just "we get acceptance from these". Decision §5.C. |

### Legal note
University logos are visual identifiers; using them with the caption «we help students get acceptance from these schools» is normally fine (nominative fair use). To be careful, I'll add a small `aria-label` / footnote: «نام و نشان‌های این دانشگاه‌ها متعلق به مالکان قانونی آن‌هاست. آلمانیار وابسته به هیچ‌یک نیست.»

### Risk
- Low for the component + animation.
- Medium for IP — placeholder text-wordmarks until owner provides real logos cleanly resolves this.

---

## 6. Open decisions (please ack) — 6 items

| # | Question | My default | If you'd rather |
|---|---|---|---|
| **A** | Universities list source: I ship Path A (my starter list of ~25, you trim/add) vs you give me the list first. | **Path A, you trim later** | Reply "I'll send the list" — I wait. |
| **B** | Marquee position: between cinematic hero and TrustModel. | **Yes, that spot** | Reply with another section. |
| **C** | Marquee heading text: «از دانشگاه‌های همکار ترکیه پذیرش می‌گیریم». | **Yes** | Reply with your phrasing. |
| **D** | Admin notification UX: **explicit «ارسال به مشتری» button** separate from save. | **Explicit button** | Reply "auto-send on save". |
| **E** | Cinematic font/position: I take fresh screenshots first + show you, then we decide together what to change. | **Screenshots first** | Reply with a specific concern. |
| **F** | Cinematic copy «در کنار توست» (informal) — change to «در کنار شماست» (formal) for register consistency? | **Change to formal** | Reply "keep informal" — the cinematic is meant to feel intimate. |

---

## 7. Execution order (after acks)

1. **Copy fix** — the brand-typo «آلمان‌یار» + any §1 stylistic edits you ack. Tiny commit.
2. **Cinematic screenshots** — local + production, send you the images, get specific feedback.
3. **Universities marquee** — depends on §5.A list path; ship logos as placeholders if Path A.
4. **Admin notify-customer feature** — schema migration + API + UI + email template + AdminEmailLog audit table.
5. **Marketing opt-in at registration** — schema migration + form checkbox + welcome email + unsubscribe endpoint.
6. **PHASE-4-REPORT.md** + full test batch.

Each task = focused commit + spec file in `tests/phase-4/` (run inline if quick, batched at end if Playwright — per [[feedback-test-runs]]).

---

## 8. Rollback strategy

| Layer | Rollback |
|---|---|
| Copy edits | Single revert. |
| Cinematic font/position changes | Single revert. |
| Universities marquee | Pure additive component. Revert removes it; logos files stay (harmless). |
| Admin notify migration | Additive nullable + new table. Drop columns / drop table. No data loss. |
| Marketing consent migration | Additive nullable. Drop columns. |
| New email pipeline | Existing `sendMail()` already wired in Phase-1; nothing new at the SMTP layer. Reverting the template files removes the new emails without breaking verification/forgot-password emails. |

---

## 9. What I need from you to proceed

1. Ack on **A–F** in §6.
2. Resolve §5.A (whether to use my starter university list or wait for yours).
3. Say "go" — I start with **the brand-typo + copy fixes** (tiny commit, builds confidence), then take cinematic screenshots, then work down the §7 list.
