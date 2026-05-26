# Phase 9 — Homepage Redesign (DESIGN DOC, no code yet)

**Date:** 2026-05-25
**Status:** Decisions locked 2026-05-25; implementation in progress.

**Locked decisions:**
- Hero treatment = single AI-generated cinematic image + Ken Burns parallax (drop GSAP 5-scene cinematic for the homepage; the journey component is still cinematic via the new Timeline section)
- PanelLanding relocates to `/fa/about` as a single section
- ContactForm relocates to a dedicated `/fa/contact` page
- Phasing = one ship (9A–9E in one session, deployed once together)
- Journey timeline steps deep-link into topic pages (my default recommendation)
- Featured articles = 3 most recent published (current behavior; no editorial flag yet)
**Current homepage (post-Phase 8F):** 8 sections — Cinematic hero, UniversityMarquee, TrustBar, TrustModel, PanelLanding, Services, LatestNewsStrip, CtaBanner, ContactForm.
**This plan reduces to 7 sections** with sharper hierarchy and conversion focus.

---

## 1. Why redesign now

Phase 8F already trimmed 4 sections off the homepage. The user still
feels it reads like a content archive rather than a guided experience.
Diagnosis:

- **No primary action.** Visitor sees Services + LatestNews + ContactForm
  + UniversityMarquee — every section asks for attention; none wins.
- **Trust signals scattered.** UniversityMarquee, TrustBar, TrustModel
  all compete for "trust" airtime.
- **No story arc.** Sections don't build to a conclusion; they list
  features.
- **PanelLanding feels promotional.** A logged-in product surface on a
  marketing page reads as "here's our admin tool" instead of "here's
  how we help."

The new structure orients around **one journey arc**:
discovery → choice → trust → process → proof → exploration → action.

---

## 2. Section-by-section spec

### §1 — HERO (cinematic)

**Purpose:** establish emotional ownership in 5 seconds. Visitor knows
what AlmanYar is, who it's for, what to do.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  [transparent sticky navbar]                     │
│                                                  │
│                                                  │
│       eyebrow:  مشاور رسمی مهاجرت تحصیلی        │
│                                                  │
│       H1:  از تهران تا برلین                     │
│            — یک مسیر روشن، گام‌به‌گام              │
│                                                  │
│       lead:  ما در ترکیه کنار شما می‌ایستیم،     │
│              تا روز نخست در آلمان.               │
│                                                  │
│       [ شروع ارزیابی رایگان  ←  ]   چگونه کار    │
│       (primary CTA, emerald)         می‌کند؟ ↗   │
│                                      (text link) │
│                                                  │
│       [مینی stat: ★ 4.9 · 250+ دانشجو]           │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Background:** keep `CinematicJourneyHero` for visual ambition, OR
swap to a single hero asset (cinematic still + Ken Burns parallax)
once real photos arrive. **Open decision** — answer in §6 below.

**Hierarchy:**
- Eyebrow (12-14px, uppercase, emerald-700, letter-spacing): brand
  identity in one line.
- H1 (clamp 36px → 64px): hook headline. Persian-RTL, balanced
  line-breaks.
- Lead (16-18px, slate-300 if dark hero / slate-700 if light): one
  sentence positioning.
- Primary CTA (emerald-700, 12px-tall, rounded-xl, ~280px wide):
  "شروع ارزیابی رایگان".
- Secondary (text-link, slate-400 on dark / emerald-700 on light):
  "چگونه کار می‌کند؟ ↗" — no second button; reduces decision fatigue.
- Inline stat strip: rating + student count, small, beneath CTAs.

**Navigation:** transparent over hero, becomes white/blur on scroll
(current Header already does this).

**Mobile:**
- H1 28-36px.
- Lead under 14px.
- CTAs stack full-width with 16px gap.
- Stat strip wraps below.
- Sticky thumb-side CTA (the floating WhatsApp already serves this
  function — keep it).

**Motion:** existing GSAP cinematic continues to work; reduced-motion
fallback already in place.

---

### §2 — THREE PATHS (the choice)

**Purpose:** user self-identifies their journey type in one screen.

**Layout (desktop):** 3 equal cards side-by-side, ~360px wide each,
24px gap.

**Layout (mobile):** stack vertically, each card full-width with 16px
gap.

**Card anatomy:**
```
┌──────────────────────────────┐
│  [icon, 48px, emerald accent]│
│                              │
│  تحصیل در آلمان              │  ← H3, 24px, bold
│                              │
│  کارشناسی، ارشد، دکتری — از  │  ← 14px, slate-600, ~2 lines
│  دانشگاه‌های دولتی آلمان       │
│                              │
│  • انتخاب دانشگاه             │  ← optional micro-list
│  • مسیر uni-assist            │
│  • ویزای دانشجویی              │
│                              │
│  مشاهده مسیر  ←              │  ← link, emerald-700
│                              │
└──────────────────────────────┘
```

**Three cards:**

1. **تحصیل در آلمان** (Study) → `/fa/study-germany`
   - Icon: graduation cap
   - Lead: "کارشناسی، ارشد، دکتری از دانشگاه‌های دولتی آلمان"
   - Bullets: انتخاب دانشگاه · مسیر uni-assist · ویزای دانشجویی

2. **اوسبیلدونگ** (Ausbildung) → `/fa/ausbildung/visa`
   - Icon: hammer-and-wrench or hard hat
   - Lead: "آموزش فنی-حرفه‌ای با پرداختی ماهانه از کارفرما"
   - Bullets: مدارک · زبان B1/B2 · ویزای کارآموزی

3. **مهاجرت کاری** (Work) → `/fa/work-germany`
   - Icon: briefcase
   - Lead: "Opportunity Card، Job Seeker Visa، EU Blue Card"
   - Bullets: ارزیابی مدارک · کارفرما · ویزای کاری

**UI pattern:** card hover → lift 4px + shadow-card + accent border-top
slides in (subtle, ~150ms).

**Spacing:** section padding `py-20 md:py-28`.

**Background:** white (light contrast with the dark hero above).

---

### §3 — WHY ALMANYAR (the trust)

**Purpose:** answer "why you, not them?" in 4 bullets. No fluff.

**Layout:** 2×2 grid (desktop), 1×4 (mobile). 4 trust pillars per the
user's brief:

| | |
|---|---|
| 🪟 **شفافیت کامل** — هزینه‌ها، زمان‌بندی و ریسک‌ها بدون مبهم‌گویی | 🤝 **پشتیبانی واقعی** — مشاور انسانی، نه ربات یا فرم |
| 🇹🇷 **۶ سال تجربه‌ی واقعی در ترکیه** — مسیر pre-Germany رو زندگی کرده‌ایم | 📋 **راهنمایی گام‌به‌گام** — از مدارک تا روز اول در آلمان |

**Card anatomy:**
- Icon (32px, brand accent)
- Title (18px, bold, slate-900)
- 1-line description (14px, slate-600, max 2 lines)

**Layout details:**
- `grid grid-cols-1 md:grid-cols-2 gap-6`
- Background: subtle off-white `#FAFAF7` to separate from white above.
- Section padding: `py-20 md:py-24`.

**Why 4 not 3:** the brief explicitly listed 4 pillars and "step-by-step"
is too central to AlmanYar's value to fold into another card.

**What's removed:** the existing TrustModel can be retired (it
duplicates this); TrustBar is also obsolete here (its content already
appears as the stat strip in the hero).

---

### §4 — JOURNEY TIMELINE (the path)

**Purpose:** show "here's the whole road, you're not alone" in one
visual. Reduces fear of unknown.

**Layout (desktop):** horizontal stepped timeline, 6 steps connected
by a thin line that fills in on scroll.

```
●━━━━━━━━━●━━━━━━━━━●━━━━━━━━━●━━━━━━━━━●━━━━━━━━━●
1          2          3          4          5          6
ترکیه       مدارک       زبان       ویزا       آلمان      استقرار
ورود +      آماده‌سازی   B1/B2      سفارت      پرواز      اقامت +
اقامت       ترجمه       Goethe     آلمان      ورود       حساب بانکی
```

**Each step:**
- Numbered circle (32px, emerald background, white number)
- Title (16px, bold)
- 1-line description (12px, slate-500)
- Optional micro-link "بیشتر بدانید →" to relevant detail page

**Layout (mobile):** vertical stacked timeline. Each step row:
- Circle on the right (RTL)
- Vertical connector line between rows
- Title + description on the left

**Animation:** as the section scrolls into view, the connector line
fills left-to-right (or top-to-bottom on mobile). Each step pops in
with a 60ms stagger. Single IntersectionObserver, no GSAP needed.

**Background:** dark navy gradient `from-slate-900 to-slate-800`. Step
numbers in emerald glow. This is the **emotional anchor** of the page —
make it feel like a cinematic chapter screen.

**Section padding:** `py-24 md:py-32` (most breathing room of any
section).

**Open question:** does the user want each step to also be a deep-link
to a topic page (e.g., step 3 "زبان" → `/fa/exams`)? My recommendation
is **yes** — turns the visual into a navigation backbone.

---

### §5 — SOCIAL PROOF (the validation)

**Purpose:** real students. Real outcomes. One screen.

**Layout:** 1 featured testimonial card (large, prominent) + 2
secondary cards beneath. Total: 3 testimonials, not 9.

**Featured card (large):**
```
┌────────────────────────────────────────────────────┐
│  [photo 80×80, circle]   [Tehran ✈ Istanbul ✈ Berlin]
│                                                    │
│  «نقل قول کوتاه و قوی — یک پاراگراف نه بیشتر…»     │
│                                                    │
│  — علی محمدی، دانشجوی ارشد TU Berlin                │
└────────────────────────────────────────────────────┘
```

**Secondary cards (2):** smaller, same shape, side-by-side on desktop.

**Aggregate stat above:**
- ★ ۴.۹ از ۵ · بر اساس ۲۵۰+ تجربه

**Why limit to 3:** the existing Testimonials component pulled the
whole DB. That's a content archive, not social proof. Three is the
psychological sweet spot — enough to feel real, not enough to scroll
past.

**Link out:** "همه‌ی تجربه‌ها →" → new `/fa/reviews` page (Phase 9
follow-up — for now, link to a temp anchor).

**Background:** white (contrast with the dark Journey section above).

---

### §6 — FEATURED ARTICLES (the depth)

**Purpose:** prove there's substance behind the surface. No more.

**Layout:** 3 article cards side-by-side. Same `PostCard` component
already built for `/fa/news`.

**Selection rule:**
- 3 most recent PUBLISHED posts (current behavior of LatestNewsStrip)
- Optionally: a `featured: boolean` field on Post for editorial override
  (Phase 9 polish — out of scope this phase)

**Section header:**
- Eyebrow: "از وبلاگ آلمانیار"
- H2: "آخرین تحلیل‌ها و راهنماها"
- Right-aligned link: "همه‌ی مقالات →"

**No category chips here.** Chips belong on `/fa/news`, not the
homepage. Reduces visual noise.

**Background:** subtle off-white `#FAFAF7`.

**Empty state:** if no posts yet, the section hides entirely (already
the behavior of LatestNewsStrip — keep this).

---

### §7 — FINAL CTA (the action)

**Purpose:** every visitor who scrolled this far gets one obvious next
step. No second-guessing.

**Layout:** single full-width banner-style section, dark navy →
emerald gradient.

```
┌────────────────────────────────────────────────────┐
│                                                    │
│    آماده‌اید مسیرتان را شروع کنید؟                 │
│                                                    │
│    یک فرم کوتاه ارزیابی، یک پاسخ شخصی              │
│    از طرف مشاور — رایگان، ۲۴ ساعته.               │
│                                                    │
│    [ شروع ارزیابی رایگان  ←  ]                    │
│    (primary CTA, white-on-emerald)                 │
│                                                    │
│       یا تماس مستقیم در WhatsApp                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

**No inline form.** Move ContactForm to a dedicated `/fa/contact` page
(or keep at the existing `#contact` anchor for backward-compat
internal links). The homepage CTA links to `/fa/evaluation` — that's
the conversion target.

**Secondary action:** WhatsApp deep-link (text-style, beneath the
button).

**Section padding:** `py-24 md:py-32`. Big finale.

---

## 3. What's removed (and where it goes)

| Removed | Why | Where it goes |
|---|---|---|
| `UniversityMarquee` | Visual noise on home; was prominence-padding | `/fa/study-germany` (relevant context) |
| `TrustBar` | Duplicates the hero stat strip + Why Almanyar | dropped |
| `PanelLanding` | Reads like a product surface, not a help signal | `/fa/about` (as a "how we work" section) or new `/fa/dashboard-tour` |
| `Services` (current) | Replaced by `ThreePaths` | replaced |
| Inline `ContactForm` | A form on the homepage is friction | `/fa/contact` (new dedicated page) |
| `TrustModel` (current) | Replaced by `WhyAlmanYar` (richer + 4 items) | replaced |
| `Testimonials` (DB-driven feed) | Replaced by curated 1+2 cards | replaced |

**Net:** 8 → 7 visible sections, every section single-purpose, every
section drives toward the final CTA.

---

## 4. Design system (consistent across all sections)

### Spacing
- Section vertical padding: `py-20 md:py-28` (default), `py-24 md:py-32`
  (anchor sections: Hero, Journey, CTA).
- Container: `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`.
- Vertical rhythm inside section: `space-y-8 md:space-y-12`.

### Typography (RTL Persian-first)
- Headings: Vazirmatn bold, `clamp()` for fluid sizing.
  - H1 (hero): `clamp(2.25rem, 4vw + 1rem, 4rem)` → 36px → 64px
  - H2 (section): `clamp(1.75rem, 2vw + 1rem, 2.5rem)` → 28px → 40px
  - H3 (card): `1.5rem` → 24px
- Body: 15-16px, `leading-8`.
- Eyebrow: 12px, uppercase (when latin), `tracking-wider`, emerald-700.

### Color
- Backgrounds alternate **light → dark → light** to give visual rhythm:
  - Hero: cinematic (dark)
  - ThreePaths: white
  - WhyAlmanYar: warm off-white `#FAFAF7`
  - Journey: dark navy gradient
  - SocialProof: white
  - FeaturedArticles: off-white
  - FinalCTA: emerald/navy gradient
- Brand accents: emerald `#047857` + warm gold `#D97706` (same as
  email template, same as topic GROUP_STYLE).

### Component patterns to reuse
- `PostCard` (Phase 8D) → featured articles.
- `RelatedLinks` (Phase 8E) → could be reused inside ThreePaths if we
  later want per-card sub-bullets.
- `PageHero` not used here — the hero is bespoke (cinematic).

### New components to build
- `ThreePaths` — the 3-card row for §2.
- `WhyAlmanYar` — 2×2 grid for §3.
- `JourneyTimeline` — horizontal-stepper for §4 (new IO-based animation).
- `SocialProof` — featured + secondary card layout for §5.
- `FinalCTA` — dark gradient banner for §7.

Total: 5 new components.

### Animations
- **No GSAP needed for the new sections** (keep GSAP scoped to the
  hero where it's earning its keep).
- IntersectionObserver-based reveal: opacity 0→100 + 24px translate-Y,
  150ms cubic-bezier(0.4, 0, 0.2, 1), per-element stagger 60ms.
- Hover: lift 4px + shadow change, 150ms.
- `prefers-reduced-motion: reduce` disables all transforms (already
  the pattern in the cinematic hero).

### Mobile-first details
- All grids degrade to `grid-cols-1` below `md`.
- Hero: cinematic scroll-pin disabled on mobile (already done — uses
  the static fallback).
- Touch targets: minimum 44×44, padding `px-6 py-3` on CTAs.
- Font scaling: clamp() for all headings so no media queries needed.
- Sticky thumb-side CTA: existing floating WhatsApp covers this.

---

## 5. Copy direction (Persian)

### Tone
- Calm, factual, slightly emotional. Not salesy.
- Avoid superlatives ("بهترین", "تضمین کامل") — risk + trust dilution.
- Use specific numbers where possible ("۶ سال تجربه", "۲۵۰+ دانشجو").

### Hero options (pick one in §6)

A. Aspirational
> از تهران تا برلین
> یک مسیر روشن، گام‌به‌گام

B. Direct
> مهاجرت تحصیلی به آلمان از مسیر ترکیه
> با مشاوری که خودش این مسیر را زندگی کرده

C. Emotional
> آلمان دور نیست،
> فقط راهش گم شده — ما کنارتانیم تا روزی که برسید.

My pick: **A** (Aspirational) — fits the cinematic style, doesn't
oversell, leaves room for the lead sentence to do positioning work.

### Path card headlines
- تحصیل در آلمان
- اوسبیلدونگ
- مهاجرت کاری

### Journey step labels (6 steps)
1. ورود به ترکیه
2. آماده‌سازی مدارک
3. آزمون زبان
4. وقت سفارت آلمان
5. پرواز به آلمان
6. استقرار و اقامت

### Final CTA
> آماده‌اید مسیرتان را شروع کنید؟
> یک فرم کوتاه، یک پاسخ شخصی. رایگان.

---

## 6. Open decisions for user (resolve before any code lands)

1. **Hero treatment** — keep the existing GSAP cinematic (visual
   ambition, but built with CSS/SVG so the "realistic photo" feeling is
   limited), OR replace with a single cinematic still + Ken Burns
   parallax (needs ONE real hero image — AI-generated is fine).
2. **Journey timeline links** — should each of the 6 steps deep-link
   into a relevant topic page (recommended: yes), or stay visual-only?
3. **ContactForm relocation** — move to a new `/fa/contact` page
   (recommended) or keep at `#contact` on homepage (less work, more
   clutter)?
4. **PanelLanding fate** — drop entirely, move to `/fa/about`, or
   move to a new `/fa/dashboard-tour` marketing page?
5. **Featured articles selection** — "3 most recent" (current behavior)
   or add an editorial `featured: boolean` flag on Post for manual
   override?
6. **Implementation phasing** — build all 5 new components + retire
   old ones in one ship (Phase 9 single commit), or staged (one
   section per commit, 6 commits)?

---

## 7. Implementation phasing (after user signs off)

If we ship as **one phase**:

| # | Commit | Scope |
|---|---|---|
| 9A | `feat(home): new section components` | Build ThreePaths, WhyAlmanYar, JourneyTimeline, SocialProof, FinalCTA. No homepage changes yet. |
| 9B | `feat(home): rewire HomeClient to new layout` | Swap sections. Drop UniversityMarquee, TrustBar, TrustModel, PanelLanding, Services, inline ContactForm. |
| 9C | `feat(pages): /fa/contact dedicated page` | Move ContactForm there. |
| 9D | `feat(pages): /fa/about absorbs PanelLanding/UniversityMarquee content` | Don't lose the content; relocate. |
| 9E | `test + report` | Playwright + PHASE-9-REPORT.md |

Realistic estimate: 1 long session (2–3h) for 9A–9C, then 9D and 9E
can be follow-ups.

If staged: 9A (build only) → user reviews each component visually in
isolation → 9B (rewire) only after sign-off.

---

## 8. Risks

- **Removing PanelLanding** is the highest-risk change — the user
  spent Phase 5 building the panel; surfacing it on home was the
  payoff. Pushing it to `/fa/about` reduces visibility. **Mitigation:**
  keep one sentence + screenshot link on `/fa/about` rather than
  removing it entirely.
- **Journey timeline desktop horizontal scroll** — 6 steps in a row
  is tight on 1024×768. **Mitigation:** wrap to 2 rows of 3 below
  `lg`, or shorten step labels.
- **Cinematic hero performance on mobile** — already a real cost.
  **Mitigation:** the existing static fallback already kicks in;
  don't change this behavior.

---

## 9. Out of scope (intentionally)

- Header / navbar redesign — current Header is fine.
- Footer redesign — Phase 7 already polished it.
- Color-system overhaul — current emerald/gold works.
- Adding video assets to hero — see §6 q1.
- A/B testing infra — single design ships.
- Personalization (different content per visitor segment) — not yet.
