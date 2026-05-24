'use client';

/**
 * Apple-style, scroll-driven cinematic hero for the AlmanYar homepage.
 *
 * Architecture
 * ------------
 *  - One outer <section> spans ~520vh (desktop) / ~420vh (mobile). That tall
 *    container is what the browser actually scrolls through.
 *  - GSAP ScrollTrigger PINS the inner viewport-sized <div> for the entire
 *    height of that section, and scrubs a single timeline so every layer is
 *    driven by the user's scroll position — no autoplay loops, no jank.
 *  - Five absolutely-positioned "scenes" share the pinned stage. Their
 *    opacity, transforms and the global flag-color tints are interpolated
 *    by GSAP — the scenes never unmount, so transitions are continuous.
 *  - The country flag palettes (Iran green/white/red, Turkey red/white,
 *    Germany black/red/gold) live on full-bleed gradient overlays whose
 *    opacities are tweened by the timeline. Accent text colors and the
 *    progress bar gradient are exposed as CSS variables and tweened in
 *    parallel.
 *  - `prefers-reduced-motion` short-circuits everything to a calm stacked
 *    render with identical copy/visuals (no scroll-jacking).
 *
 * Performance notes
 * -----------------
 *  - Only `transform`, `opacity` and CSS variables are animated.
 *  - All scenes are mounted once; transitions are cross-fades.
 *  - `will-change` is left to the browser to manage via the GSAP plugin.
 *  - The film-grain layer is a single SVG <feTurbulence> rect (~6kb).
 *  - On screens < 768px the pinned distance shrinks, the parallax range
 *    shrinks, and the film grain is suppressed.
 */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Dictionary, Locale } from '@/lib/i18n';
import { localePath } from '@/lib/i18n';
import Counter from '@/components/Counter';
import {
  TehranSkyline,
  IstanbulSkyline,
  BerlinSkyline,
  Clouds,
  Plane,
} from './Skylines';
import { Starfield, Glow } from './Atmosphere';
import {
  AirportTower,
  Passport,
  BoardingPass,
  ExamPaper,
  TrainSBahn,
  UniversityGate,
  FilmGrain,
} from './SceneMotifs';

// Real AlmanYar WhatsApp (Turkey, +90 506 770 8295).
const WHATSAPP_URL = 'https://wa.me/905067708295';

import type { SiteStatsView } from '@/lib/site-stats';

type Props = {
  dict: Dictionary;
  locale: Locale;
  stats: SiteStatsView;
  onReviewClick: () => void;
};

// Stat cells. `value` is read from `stats`; the cell is hidden when nullish/0.
type StatKey = 'students' | 'universities' | 'success' | 'experience';
const STAT_DEFS: Array<{ key: StatKey; field: keyof SiteStatsView; suffix: string }> = [
  { key: 'students',     field: 'students',     suffix: '+' },
  { key: 'universities', field: 'universities', suffix: '+' },
  { key: 'success',      field: 'success',      suffix: '٪' },
  { key: 'experience',   field: 'experience',   suffix: '+' },
];

/* ────────────────────────── Flag color palettes ────────────────────────── */

// Each palette is a few harmonized stops drawn from the country's flag —
// softened and desaturated so the page never feels literal or childish.
// They are layered as full-bleed gradients whose opacity is scrubbed.
const PALETTES = {
  // Iran: deep emerald → cinematic ivory mist → ember red, against a moody night base.
  iran: {
    bgA: '#062014',
    bgB: '#0c2d1e',
    accentTop: 'rgba(28, 122, 76, 0.65)', // green
    accentMid: 'rgba(245, 240, 232, 0.10)', // ivory mist
    accentBot: 'rgba(193, 41, 46, 0.55)', // red
    glowWarm: 'rgba(255, 220, 180, 0.18)',
    glowCool: 'rgba(40, 170, 110, 0.22)',
    accent: '#62d1a0', // bright text accent
  },
  // Turkey: rich crimson cinema, warm white spotlight.
  turkey: {
    bgA: '#330709',
    bgB: '#5a0e12',
    accentTop: 'rgba(196, 28, 36, 0.7)',
    accentMid: 'rgba(255, 245, 240, 0.18)',
    accentBot: 'rgba(120, 12, 16, 0.65)',
    glowWarm: 'rgba(255, 230, 220, 0.22)',
    glowCool: 'rgba(255, 90, 90, 0.18)',
    accent: '#ffb3b3',
  },
  // Germany: deep graphite, brushed gold light, controlled red accent.
  germany: {
    bgA: '#0a0a0e',
    bgB: '#1a1209',
    accentTop: 'rgba(20, 20, 22, 0.78)', // black band
    accentMid: 'rgba(204, 38, 38, 0.45)', // red band
    accentBot: 'rgba(255, 200, 60, 0.55)', // gold band
    glowWarm: 'rgba(255, 200, 80, 0.28)',
    glowCool: 'rgba(255, 80, 80, 0.18)',
    accent: '#ffd166',
  },
  // AlmanYar reveal — the brand harmonized with all three.
  brand: {
    bgA: '#0b0f24',
    bgB: '#1c1444',
    accentTop: 'rgba(102, 126, 234, 0.55)',
    accentMid: 'rgba(255, 255, 255, 0.12)',
    accentBot: 'rgba(118, 75, 162, 0.55)',
    glowWarm: 'rgba(255, 209, 102, 0.22)',
    glowCool: 'rgba(102, 126, 234, 0.28)',
    accent: '#a5b4fc',
  },
} as const;

type PaletteKey = keyof typeof PALETTES;

/* ───────────────────────── Tiny presentational helpers ────────────────── */

function Chip({ tone, children }: { tone: 'dark' | 'light'; children: ReactNode }) {
  const cls =
    tone === 'dark'
      ? 'border-white/20 bg-white/10 text-white/95'
      : 'border-slate-300 bg-white/70 text-slate-700';
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold backdrop-blur-md ${cls}`}
    >
      {children}
    </span>
  );
}

function Chips({ items, tone }: { items: string[]; tone: 'dark' | 'light' }) {
  const cls =
    tone === 'dark'
      ? 'border-white/20 bg-white/10 text-white/90'
      : 'border-slate-300 bg-white/70 text-slate-700';
  return (
    <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
      {items.map((c) => (
        <span
          key={c}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-md sm:text-sm ${cls}`}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

/* ───────────────────────────── Scene definitions ──────────────────────── */

/**
 * A pinned scene = a full-bleed absolutely-positioned layer that the timeline
 * cross-fades in/out. Each scene exports the visuals it needs; the timeline
 * separately animates inner refs for "live" intra-scene choreography
 * (plane glide, passport zoom, train slide, etc.).
 */

function IranScene({ rootRef }: { rootRef: (el: HTMLDivElement | null) => void }) {
  return (
    <div
      ref={rootRef}
      className="cj-scene absolute inset-0"
      data-palette="iran"
      aria-hidden="true"
    >
      {/* deep night */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, rgba(40, 80, 60, 0.35), transparent 60%), linear-gradient(180deg, ${PALETTES.iran.bgA} 0%, ${PALETTES.iran.bgB} 100%)`,
        }}
      />
      <Starfield />
      <Glow className="-end-10 top-[8%] h-72 w-72 rounded-full" color={PALETTES.iran.glowCool} />
      <Glow className="-start-12 bottom-[18%] h-80 w-80 rounded-full" color={PALETTES.iran.glowWarm} />

      {/* mountains/skyline */}
      <TehranSkyline
        className="cj-iran-skyline absolute inset-x-0 bottom-0 h-[46%] w-full text-[#04140a]"
      />

      {/* airport control tower glides in from the right (RTL: from the start side) */}
      <div className="cj-iran-airport pointer-events-none absolute bottom-[18%] start-[6%] h-44 w-32 text-emerald-200/80 drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)] sm:h-56 sm:w-40">
        <AirportTower className="h-full w-full" />
      </div>
    </div>
  );
}

function FlightScene({ rootRef }: { rootRef: (el: HTMLDivElement | null) => void }) {
  return (
    <div
      ref={rootRef}
      className="cj-scene absolute inset-0"
      data-palette="iran-to-turkey"
      aria-hidden="true"
    >
      {/* sky gradient that drifts from Iran greens to Turkey reds */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0e1c2d 0%, #2a2238 40%, #6b1a1f 80%, #9a2128 100%)',
        }}
      />
      <Glow className="-start-20 top-[22%] h-96 w-96 rounded-full" color="rgba(255, 200, 150, 0.22)" />
      <Glow className="-end-16 bottom-[10%] h-80 w-80 rounded-full" color="rgba(255, 90, 90, 0.18)" />

      {/* layered clouds — slow + fast bands */}
      <Clouds className="cj-flight-clouds-slow pointer-events-none absolute inset-x-0 top-[18%] h-28 w-full text-white/70" />
      <Clouds className="cj-flight-clouds-fast pointer-events-none absolute inset-x-0 top-[52%] h-32 w-full text-white/55" />

      {/* the plane glides L→R and rises slightly */}
      <div className="cj-flight-plane pointer-events-none absolute start-0 top-[40%] h-20 w-auto text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:h-28">
        <Plane className="h-full w-auto" />
      </div>

      {/* passport floats in mid-scene, then drifts out */}
      <div className="cj-flight-passport pointer-events-none absolute bottom-[14%] start-[8%] h-48 w-36 text-emerald-100 drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)] sm:h-60 sm:w-44">
        <Passport className="h-full w-full" />
      </div>

      {/* boarding pass rotates in from right */}
      <div className="cj-flight-boarding pointer-events-none absolute bottom-[20%] end-[6%] h-32 w-72 text-slate-900 drop-shadow-[0_18px_40px_rgba(0,0,0,0.5)] sm:h-36 sm:w-80">
        <BoardingPass className="h-full w-full" />
      </div>
    </div>
  );
}

function TurkeyScene({ rootRef }: { rootRef: (el: HTMLDivElement | null) => void }) {
  return (
    <div
      ref={rootRef}
      className="cj-scene absolute inset-0"
      data-palette="turkey"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, rgba(255, 180, 140, 0.18), transparent 60%), linear-gradient(180deg, ${PALETTES.turkey.bgA} 0%, ${PALETTES.turkey.bgB} 100%)`,
        }}
      />
      <Glow className="end-[14%] top-[12%] h-72 w-72 rounded-full" color={PALETTES.turkey.glowWarm} />
      <Glow className="-start-10 bottom-[10%] h-96 w-96 rounded-full" color={PALETTES.turkey.glowCool} />

      <IstanbulSkyline
        className="cj-turkey-skyline absolute inset-x-0 bottom-0 h-[46%] w-full text-[#2a0608]"
      />

      {/* exam paper drifts up + scales — represents preparation */}
      <div className="cj-turkey-exam pointer-events-none absolute bottom-[22%] start-[10%] h-44 w-36 text-rose-100 drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)] sm:h-56 sm:w-44">
        <ExamPaper className="h-full w-full" />
      </div>
    </div>
  );
}

function GermanyScene({ rootRef }: { rootRef: (el: HTMLDivElement | null) => void }) {
  return (
    <div
      ref={rootRef}
      className="cj-scene absolute inset-0"
      data-palette="germany"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, rgba(255, 200, 80, 0.10), transparent 60%), linear-gradient(180deg, ${PALETTES.germany.bgA} 0%, ${PALETTES.germany.bgB} 100%)`,
        }}
      />
      <Glow className="end-[10%] top-[10%] h-80 w-80 rounded-full" color={PALETTES.germany.glowWarm} />
      <Glow className="-start-10 bottom-[14%] h-80 w-80 rounded-full" color={PALETTES.germany.glowCool} />

      {/* faint grid for the precise/modern feel */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-25" aria-hidden="true" />

      <BerlinSkyline
        className="cj-germany-skyline absolute inset-x-0 bottom-0 h-[44%] w-full text-amber-100/85"
      />

      {/* train slides across the lower third */}
      <div className="cj-germany-train pointer-events-none absolute bottom-[24%] start-0 h-20 w-[58%] text-amber-200 drop-shadow-[0_16px_32px_rgba(0,0,0,0.55)] sm:h-24 sm:w-[46%]">
        <TrainSBahn className="h-full w-full" />
      </div>

      {/* university gate rises in from the right */}
      <div className="cj-germany-uni pointer-events-none absolute bottom-[10%] end-[6%] h-48 w-72 text-amber-100/90 drop-shadow-[0_18px_40px_rgba(0,0,0,0.6)] sm:h-60 sm:w-96">
        <UniversityGate className="h-full w-full" />
      </div>
    </div>
  );
}

function BrandScene({
  rootRef,
  props,
}: {
  rootRef: (el: HTMLDivElement | null) => void;
  props: Props;
}) {
  const { dict, locale, stats, onReviewClick } = props;
  // Stat cells with a non-null, non-zero value. Empty array hides the whole grid.
  const visibleStats = STAT_DEFS.flatMap((d) => {
    const value = stats[d.field] as number | null;
    return value == null || value === 0 ? [] : [{ key: d.key, value, suffix: d.suffix }];
  });
  const ratingVisible = (stats.reviews ?? 0) > 0 && stats.rating != null;
  return (
    <div
      ref={rootRef}
      className="cj-scene absolute inset-0"
      data-palette="brand"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${PALETTES.brand.bgA} 0%, ${PALETTES.brand.bgB} 100%)`,
        }}
        aria-hidden="true"
      />
      <Glow className="start-[12%] top-[8%] h-80 w-80 rounded-full" color="rgba(255,255,255,0.20)" />
      <Glow className="end-[8%] bottom-[12%] h-96 w-96 rounded-full" color={PALETTES.brand.glowCool} />
      <Glow className="inset-x-0 bottom-0 h-[55%]" color={PALETTES.brand.glowWarm} />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-15" aria-hidden="true" />

      <div className="pointer-events-auto relative z-30 mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-5 text-center sm:px-6">
        <Chip tone="dark">🤝 آلمانیار</Chip>
        <h2 className="cj-brand-title mt-6 text-balance text-3xl font-extrabold leading-[1.2] tracking-tight text-white sm:text-4xl md:text-5xl">
          آلمانیار، همراه هوشمند مسیر مهاجرت شما
        </h2>
        <p className="cj-brand-sub mt-5 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
          از نخستین تصمیم در تهران تا روز اول زندگی در آلمان، یک مسیر روشن، گام‌به‌گام و قابل اعتماد در کنار شماست.
        </p>

        <div className="cj-brand-chips mt-7">
          <Chips
            tone="dark"
            items={[
              'راهنمای گام‌به‌گام',
              'آزمون‌های زبان',
              'ویزا و سفارت',
              'دانشگاه و پذیرش',
              'مسکن',
              'استقرار در آلمان',
            ]}
          />
        </div>

        {visibleStats.length > 0 && (
          <div className="cj-brand-stats mx-auto mt-8 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {visibleStats.map(({ key, value, suffix }) => (
              <div
                key={key}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-md"
              >
                <div className="text-2xl font-bold text-white md:text-3xl">
                  <Counter target={value} />
                  <span className="text-lg" style={{ color: 'var(--cj-accent)' }}>
                    {suffix}
                  </span>
                </div>
                <div className="mt-1 text-xs font-medium text-white/70">
                  {dict.hero.stats[key]}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cj-brand-ctas mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={localePath(locale, '/evaluation')}
            className="inline-flex w-full items-center justify-center rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-soft transition hover:bg-slate-100 sm:w-auto"
          >
            فرم ارزیابی رایگان
          </Link>
          <Link
            href={localePath(locale, '#contact')}
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 sm:w-auto"
          >
            مشاوره رایگان
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-600 sm:w-auto"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-.607zm5.91-6.41c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            واتساپ
          </a>
        </div>

        {ratingVisible && (
          <button
            type="button"
            onClick={onReviewClick}
            className="cj-brand-rating mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/80 underline-offset-4 transition hover:text-white hover:underline"
          >
            <span className="text-amber-300">★ {stats.rating!.toFixed(1)}</span>
            {dict.hero.basedOn.replace('{n}', String(stats.reviews ?? 0))} — {dict.hero.writeReview}
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Caption pillars (foreground copy) ──────────── */

/**
 * The Persian emotional copy is rendered as a stack of absolutely-positioned
 * captions on the foreground. The timeline brings each in/out independently
 * from its scene visuals — so text can finish reading before the visuals
 * dissolve, the Apple-page hallmark.
 */
function Captions() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <div className="relative h-full w-full max-w-3xl px-5 sm:px-6">
        <CaptionBlock
          id="iran"
          eyebrow="📍 ایران"
          title="مهاجرت تحصیلی به آلمان از ترکیه"
          subtitle="سفارت آلمان در تهران غیرقابل پیش‌بینی است. مسیر امن از ترکیه شروع می‌شود — ۶ ماه آماده‌سازی، اقامت دانشجویی، سفارت قابل دسترس."
        />
        <CaptionBlock
          id="flight"
          eyebrow="✈️ آغاز سفر"
          title="و تو، تصمیم گرفتی پرواز کنی"
          subtitle="میان ترس و امید، نخستین قدم را برمی‌داری."
        />
        <CaptionBlock
          id="turkey"
          eyebrow="🌅 ترکیه"
          title="از تهران تا استانبول؛ از ابهام تا برنامه‌ریزی"
          subtitle="مدارک، آزمون، وقت سفارت و مسیر درست."
          chips={['آزمون زبان', 'پذیرش دانشگاه', 'وقت سفارت', 'تکمیل مدارک', 'اقامت تحصیلی']}
        />
        <CaptionBlock
          id="germany"
          eyebrow="🇩🇪 آلمان"
          title="و در نهایت، آلمان؛ شروع یک زندگی تازه"
          subtitle="تحصیل، کار و زندگی در یکی از پیشرفته‌ترین کشورهای جهان."
        />
      </div>
    </div>
  );
}

function CaptionBlock({
  id,
  eyebrow,
  title,
  subtitle,
  chips,
}: {
  id: 'iran' | 'flight' | 'turkey' | 'germany';
  eyebrow: string;
  title: string;
  subtitle: string;
  chips?: string[];
}) {
  return (
    <div
      data-caption={id}
      className="cj-caption absolute inset-x-0 top-1/2 -translate-y-1/2 text-center"
    >
      <span
        className="cj-caption-eyebrow inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md"
        style={{ borderColor: 'var(--cj-accent-border, rgba(255,255,255,0.2))' }}
      >
        {eyebrow}
      </span>
      <h2 className="cj-caption-title mx-auto mt-5 max-w-2xl text-balance text-3xl font-extrabold leading-[1.2] tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="cj-caption-sub mx-auto mt-5 max-w-xl text-base leading-8 text-white/85 md:text-lg">
        {subtitle}
      </p>
      {chips ? (
        <div className="cj-caption-chips">
          <Chips items={chips} tone="dark" />
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────── Reduced-motion fallback ─────────────────────── */

/**
 * Calm, stacked render with the same copy/visuals but no scroll-jacking,
 * cross-fades, or moving props. Used when `prefers-reduced-motion: reduce`
 * is set, when JS is disabled, or as the server-render base.
 */
function StaticFallback({ props }: { props: Props }) {
  return (
    <section aria-label="مسیر مهاجرت به آلمان">
      <div className="relative min-h-[80vh] w-full overflow-hidden bg-[#06140c] py-16 text-white">
        <IranScene rootRef={() => {}} />
        <div className="relative z-30 mx-auto max-w-3xl px-5 text-center">
          <Chip tone="dark">📍 ایران</Chip>
          <h2 className="mt-5 text-3xl font-extrabold leading-[1.2] sm:text-4xl">
            مهاجرت تحصیلی به آلمان از ترکیه
          </h2>
          <p className="mt-4 text-white/80">سفارت آلمان در تهران غیرقابل پیش‌بینی است. مسیر امن از ترکیه شروع می‌شود — ۶ ماه آماده‌سازی، اقامت دانشجویی، سفارت قابل دسترس.</p>
        </div>
      </div>
      <div className="relative min-h-[80vh] w-full overflow-hidden bg-[#5a0e12] py-16 text-white">
        <TurkeyScene rootRef={() => {}} />
        <div className="relative z-30 mx-auto max-w-3xl px-5 text-center">
          <Chip tone="dark">🌅 ترکیه</Chip>
          <h2 className="mt-5 text-3xl font-extrabold leading-[1.2] sm:text-4xl">
            از تهران تا استانبول؛ از ابهام تا برنامه‌ریزی
          </h2>
          <p className="mt-4 text-white/80">مدارک، آزمون، وقت سفارت و مسیر درست.</p>
        </div>
      </div>
      <div className="relative min-h-[80vh] w-full overflow-hidden bg-[#0a0a0e] py-16 text-white">
        <GermanyScene rootRef={() => {}} />
        <div className="relative z-30 mx-auto max-w-3xl px-5 text-center">
          <Chip tone="dark">🇩🇪 آلمان</Chip>
          <h2 className="mt-5 text-3xl font-extrabold leading-[1.2] sm:text-4xl">
            و در نهایت، آلمان؛ شروع یک زندگی تازه
          </h2>
          <p className="mt-4 text-white/80">تحصیل، کار و زندگی در یکی از پیشرفته‌ترین کشورهای جهان.</p>
        </div>
      </div>
      <div className="relative min-h-screen w-full overflow-hidden py-16">
        <BrandScene rootRef={() => {}} props={props} />
      </div>
    </section>
  );
}

/* ───────────────────────────── Main component ─────────────────────────── */

export default function CinematicJourneyHero(props: Props) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (reduced) return <StaticFallback props={props} />;

  return <AnimatedHero {...props} />;
}

function AnimatedHero(props: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Per-scene root refs. Storing them on a record so the timeline can reach
  // each layer without prop-drilling refs through five components.
  const sceneRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setSceneRef = (key: string) => (el: HTMLDivElement | null) => {
    sceneRefs.current[key] = el;
  };

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    // Reduced-motion users get the static fallback rendered below — we don't
    // register the scroll-driven timeline at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    // Pin distance: ~5.2 screen-heights desktop, ~4.2 mobile.
    const pinDistanceVh = isMobile ? 420 : 520;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${pinDistanceVh}%`,
          pin: stageRef.current,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Pre-state: everything except scene 1 is hidden / pre-positioned.
      gsap.set('.cj-scene', { opacity: 0 });
      gsap.set('.cj-caption', { opacity: 0, y: 40 });
      gsap.set(sceneRefs.current.iran, { opacity: 1 });
      gsap.set('.cj-caption[data-caption="iran"]', { opacity: 1, y: 0 });

      // Flag-color planes start hidden — each scene tweens its own to 1.
      gsap.set('.cj-flag-plate', { opacity: 0 });
      gsap.set('.cj-flag-plate[data-flag="iran"]', { opacity: 1 });

      // ────── Iran intro (0 → 1): subtle drift + skyline rise ──────
      tl.fromTo(
        '.cj-iran-skyline',
        { y: 30, scale: 1.02 },
        { y: 0, scale: 1, duration: 1 },
        0,
      )
        .fromTo(
          '.cj-iran-airport',
          { x: isMobile ? 40 : 80, opacity: 0 },
          { x: 0, opacity: 1, duration: 1 },
          0,
        )
        .fromTo(
          '.cj-caption[data-caption=\"iran\"] .cj-caption-title',
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          0,
        );

      // ────── Iran → exit (1 → 2): zoom out, fade ──────
      tl.to(
        '.cj-caption[data-caption="iran"]',
        { y: -40, opacity: 0, duration: 0.6 },
        1,
      )
        .to(sceneRefs.current.iran, { opacity: 0, scale: 1.08, duration: 1 }, 1)
        // Cross-fade the flag plate: Iran out → mix toward Turkey
        .to('.cj-flag-plate[data-flag="iran"]', { opacity: 0, duration: 1 }, 1)
        .fromTo(
          '.cj-flag-plate[data-flag="flight"]',
          { opacity: 0 },
          { opacity: 1, duration: 1 },
          1,
        );

      // ────── Flight scene (2 → 3) ──────
      tl.fromTo(
        sceneRefs.current.flight,
        { opacity: 0, scale: 1.05 },
        { opacity: 1, scale: 1, duration: 1 },
        1.4,
      )
        .fromTo(
          '.cj-caption[data-caption="flight"]',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          1.6,
        )
        // Plane glides L→R with slight rise, then exits right.
        .fromTo(
          '.cj-flight-plane',
          { xPercent: -40, yPercent: 10, rotation: -2 },
          { xPercent: 120, yPercent: -8, rotation: 2, duration: 1.6 },
          1.4,
        )
        .fromTo(
          '.cj-flight-clouds-slow',
          { x: isMobile ? -40 : -80 },
          { x: isMobile ? 40 : 80, duration: 1.6 },
          1.4,
        )
        .fromTo(
          '.cj-flight-clouds-fast',
          { x: isMobile ? 80 : 160 },
          { x: isMobile ? -80 : -160, duration: 1.6 },
          1.4,
        )
        // Passport zooms in and tilts.
        .fromTo(
          '.cj-flight-passport',
          { scale: 0.7, rotation: -8, opacity: 0 },
          { scale: 1, rotation: -4, opacity: 1, duration: 0.6 },
          1.6,
        )
        .to(
          '.cj-flight-passport',
          { scale: 1.05, rotation: 0, opacity: 0, duration: 0.6 },
          2.3,
        )
        // Boarding pass slides in from right with a slight rotation.
        .fromTo(
          '.cj-flight-boarding',
          { xPercent: 60, rotation: 8, opacity: 0 },
          { xPercent: 0, rotation: -3, opacity: 1, duration: 0.6 },
          2.0,
        );

      // Boarding pass exits earlier than the rest of the flight scene so it
      // can't bleed into the Turkey caption during the cross-fade. Phase-4
      // readability fix: production screenshot showed the boarding pass
      // overlapping the Turkey title at scrub ~44%.
      tl.to(
        '.cj-flight-boarding',
        { xPercent: -40, opacity: 0, duration: 0.3 },
        2.55,
      );

      // Exit flight
      tl.to(
        '.cj-caption[data-caption="flight"]',
        { y: -40, opacity: 0, duration: 0.5 },
        2.7,
      )
        .to(sceneRefs.current.flight, { opacity: 0, scale: 1.05, duration: 0.8 }, 2.7)
        .to('.cj-flag-plate[data-flag="flight"]', { opacity: 0, duration: 0.8 }, 2.7)
        .fromTo(
          '.cj-flag-plate[data-flag="turkey"]',
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          2.7,
        );

      // ────── Turkey scene (3 → 4) ──────
      tl.fromTo(
        sceneRefs.current.turkey,
        { opacity: 0, scale: 1.05 },
        { opacity: 1, scale: 1, duration: 0.8 },
        2.9,
      )
        .fromTo(
          '.cj-turkey-skyline',
          { y: 60 },
          { y: 0, duration: 1.4 },
          2.9,
        )
        .fromTo(
          '.cj-turkey-exam',
          { y: 80, rotation: -6, opacity: 0 },
          { y: 0, rotation: 0, opacity: 1, duration: 0.8 },
          3.1,
        )
        .fromTo(
          '.cj-caption[data-caption="turkey"]',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          3.1,
        );

      // Exit turkey
      tl.to(
        '.cj-caption[data-caption="turkey"]',
        { y: -40, opacity: 0, duration: 0.5 },
        4.0,
      )
        .to(sceneRefs.current.turkey, { opacity: 0, scale: 1.06, duration: 0.8 }, 4.0)
        .to('.cj-flag-plate[data-flag="turkey"]', { opacity: 0, duration: 0.8 }, 4.0)
        .fromTo(
          '.cj-flag-plate[data-flag="germany"]',
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          4.0,
        );

      // ────── Germany scene (4 → 5) ──────
      tl.fromTo(
        sceneRefs.current.germany,
        { opacity: 0, scale: 1.05 },
        { opacity: 1, scale: 1, duration: 0.8 },
        4.2,
      )
        .fromTo(
          '.cj-germany-skyline',
          { y: 50 },
          { y: 0, duration: 1.4 },
          4.2,
        )
        .fromTo(
          '.cj-germany-train',
          { xPercent: -110 },
          { xPercent: 180, duration: 1.6 },
          4.2,
        )
        .fromTo(
          '.cj-germany-uni',
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          4.4,
        )
        .fromTo(
          '.cj-caption[data-caption="germany"]',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          4.4,
        );

      // Exit Germany → AlmanYar
      tl.to(
        '.cj-caption[data-caption="germany"]',
        { y: -40, opacity: 0, duration: 0.5 },
        5.2,
      )
        .to(sceneRefs.current.germany, { opacity: 0, scale: 1.08, duration: 0.8 }, 5.2)
        .to('.cj-flag-plate[data-flag="germany"]', { opacity: 0, duration: 0.8 }, 5.2)
        .fromTo(
          '.cj-flag-plate[data-flag="brand"]',
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          5.2,
        );

      // ────── AlmanYar reveal (5 → 6) ──────
      tl.fromTo(
        sceneRefs.current.brand,
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 0.8 },
        5.4,
      )
        .fromTo(
          '.cj-brand-title',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          5.6,
        )
        .fromTo(
          '.cj-brand-sub',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          5.7,
        )
        .fromTo(
          ['.cj-brand-chips', '.cj-brand-stats', '.cj-brand-ctas', '.cj-brand-rating'],
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
          5.8,
        );

      // Progress bar (RTL: grows from the right edge inward).
      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: `+=${pinDistanceVh}%`,
              scrub: true,
            },
          },
        );
      }

      // Refresh once after fonts/SVGs settle so pin math is right.
      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        aria-label="مسیر مهاجرت به آلمان"
        className="relative w-full"
        // Tall outer container — ScrollTrigger pins the inner stage for this distance.
        // The numeric value is just a fallback; pin math is driven by the
        // `end: "+=520%"` token above.
        style={{ minHeight: '600vh' }}
      >
        <div
          ref={stageRef}
          className="relative h-screen w-full overflow-hidden bg-[#03050d] text-white"
          style={
            {
              // Exposed CSS variables — captions/borders pick these up via var().
              ['--cj-accent' as never]: PALETTES.iran.accent,
              ['--cj-accent-border' as never]: 'rgba(255,255,255,0.22)',
            } as React.CSSProperties
          }
        >
          {/* Progress bar — RTL right-origin */}
          <div
            ref={progressRef}
            className="absolute inset-x-0 top-0 z-50 h-1 origin-right bg-gradient-to-l from-emerald-400 via-rose-400 to-amber-300"
            aria-hidden="true"
          />

          {/* ── Flag color plates: full-bleed gradients per stage ── */}
          {/* Iran: green / white / red */}
          <div
            className="cj-flag-plate pointer-events-none absolute inset-0 z-10 mix-blend-screen"
            data-flag="iran"
            aria-hidden="true"
            style={{
              background: `linear-gradient(180deg, ${PALETTES.iran.accentTop} 0%, ${PALETTES.iran.accentMid} 50%, ${PALETTES.iran.accentBot} 100%)`,
              opacity: 0,
            }}
          />
          {/* Flight: blended Iran→Turkey */}
          <div
            className="cj-flag-plate pointer-events-none absolute inset-0 z-10 mix-blend-screen"
            data-flag="flight"
            aria-hidden="true"
            style={{
              background:
                'linear-gradient(180deg, rgba(28,122,76,0.30) 0%, rgba(245,240,232,0.10) 45%, rgba(196,28,36,0.45) 100%)',
              opacity: 0,
            }}
          />
          {/* Turkey: red / white */}
          <div
            className="cj-flag-plate pointer-events-none absolute inset-0 z-10 mix-blend-screen"
            data-flag="turkey"
            aria-hidden="true"
            style={{
              background: `linear-gradient(180deg, ${PALETTES.turkey.accentTop} 0%, ${PALETTES.turkey.accentMid} 55%, ${PALETTES.turkey.accentBot} 100%)`,
              opacity: 0,
            }}
          />
          {/* Germany: black / red / gold */}
          <div
            className="cj-flag-plate pointer-events-none absolute inset-0 z-10 mix-blend-screen"
            data-flag="germany"
            aria-hidden="true"
            style={{
              background: `linear-gradient(180deg, ${PALETTES.germany.accentTop} 0%, ${PALETTES.germany.accentMid} 50%, ${PALETTES.germany.accentBot} 100%)`,
              opacity: 0,
            }}
          />
          {/* Brand */}
          <div
            className="cj-flag-plate pointer-events-none absolute inset-0 z-10 mix-blend-screen"
            data-flag="brand"
            aria-hidden="true"
            style={{
              background: `linear-gradient(135deg, ${PALETTES.brand.accentTop} 0%, ${PALETTES.brand.accentMid} 50%, ${PALETTES.brand.accentBot} 100%)`,
              opacity: 0,
            }}
          />

          {/* ── Scenes (z-20 base; flag plates z-10, captions z-30) ── */}
          <div className="absolute inset-0 z-20">
            <IranScene rootRef={setSceneRef('iran')} />
            <FlightScene rootRef={setSceneRef('flight')} />
            <TurkeyScene rootRef={setSceneRef('turkey')} />
            <GermanyScene rootRef={setSceneRef('germany')} />
            <BrandScene rootRef={setSceneRef('brand')} props={props} />
          </div>

          {/* ── Foreground captions ── */}
          <Captions />

          {/* ── Filmic grain (desktop only) ── */}
          <div className="pointer-events-none absolute inset-0 z-40 hidden opacity-[0.06] mix-blend-overlay md:block">
            <FilmGrain className="h-full w-full" />
          </div>

          {/* ── Subtle scroll hint, fades after the first frame of scroll ── */}
          <div className="cj-scroll-hint pointer-events-none absolute inset-x-0 bottom-6 z-40 flex flex-col items-center gap-2 text-xs font-medium text-white/70">
            <span>برای مشاهدهٔ مسیر اسکرول کنید</span>
            <span className="block h-6 w-px animate-pulse bg-white/40" />
          </div>
        </div>
      </section>

    </>
  );
}
