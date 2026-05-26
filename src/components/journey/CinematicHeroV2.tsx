'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Phase-9 — Cinematic homepage hero, image-based (replaces the
 * SVG/motif version in CinematicJourneyHero.tsx).
 *
 * Apple-style scroll storytelling: 5 pinned scenes (Iran → Transit
 * → Istanbul → Germany → Brand). Each scene is one full-bleed
 * background image with a subtle Ken Burns transform (scale + pan)
 * bound to scroll position via GSAP ScrollTrigger. Captions fade
 * in shortly after each scene resolves, fade out before the next.
 *
 * Design intent:
 *   - "Subtle, clean, premium" per Phase-9 brief
 *   - No heavy motion graphics, no particles, no flag overlays —
 *     the image carries the mood, motion is just gentle binding
 *   - Reduced-motion users get a static, single-scene render
 *   - Mobile drops scroll-pin and renders a stacked static version
 *
 * Image swap workflow:
 *   - Drop /public/hero/scene-{iran,transit,istanbul,germany,brand}.jpg
 *   - That's it. The component uses next/image with the same paths;
 *     missing files fall back to a per-scene gradient so the structure
 *     stays usable while assets are being generated.
 */

interface Scene {
  id: 'iran' | 'transit' | 'istanbul' | 'germany' | 'brand';
  imageUrl: string;
  /** Tailwind gradient classes — fallback if the image is missing
   *  AND atmospheric tint behind the image (mix-blend-multiply-ish). */
  fallbackGradient: string;
  eyebrow: string;
  title: string;
  lead: string;
  /** True only for the final brand scene — renders CTAs. */
  cta?: boolean;
}

const SCENES: Scene[] = [
  {
    id: 'iran',
    imageUrl: '/hero/scene-iran.jpg',
    fallbackGradient: 'from-amber-700 via-orange-800 to-amber-950',
    eyebrow: 'آغاز سفر',
    title: 'از سرزمین تو',
    lead: 'مسیری که با یک تصمیم آغاز می‌شود.',
  },
  {
    id: 'transit',
    imageUrl: '/hero/scene-transit.jpg',
    fallbackGradient: 'from-indigo-800 via-slate-900 to-slate-950',
    eyebrow: 'حرکت',
    title: 'به سوی فردا',
    lead: 'پروازی به سمت یک زندگی تازه.',
  },
  {
    id: 'istanbul',
    imageUrl: '/hero/scene-istanbul.jpg',
    fallbackGradient: 'from-rose-700 via-orange-800 to-amber-900',
    eyebrow: 'ترکیه',
    title: 'پل میان دو دنیا',
    lead: 'استانبول، آماده‌سازی برای فصل بعد.',
  },
  {
    id: 'germany',
    imageUrl: '/hero/scene-germany.jpg',
    fallbackGradient: 'from-slate-600 via-blue-900 to-slate-950',
    eyebrow: 'آلمان',
    title: 'فصل تازه',
    lead: 'ساختار، فرصت، شروع دوباره.',
  },
  {
    id: 'brand',
    imageUrl: '/hero/scene-brand.jpg',
    fallbackGradient: 'from-emerald-700 via-emerald-900 to-slate-950',
    eyebrow: 'آلمانیار',
    title: 'گام‌به‌گام کنار شما',
    lead: 'از ترکیه تا آلمان — مسیر روشن.',
    cta: true,
  },
];

// Each scene takes 100vh of scroll on desktop; total pinned distance =
// (N-1) × 100vh because the first scene is "free" in the initial viewport.
const SCENE_VH = 100;
const TOTAL_VH = SCENES.length * SCENE_VH;

export default function CinematicHeroV2() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const captionRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.matchMedia('(max-width: 767px)').matches;
    if (reduced || small) return; // static fallback handles these.

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top top',
          end: () => `+=${(SCENES.length - 1) * window.innerHeight}`,
          scrub: 0.6, // a touch of lag — feels filmic, not snappy
          pin: stageRef.current!,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Per-scene segment of the master timeline. Each segment is 1 unit
      // long; cross-fades overlap by 0.3 units for smoothness.
      SCENES.forEach((_, i) => {
        const scene = sceneRefs.current[i];
        const caption = captionRefs.current[i];
        if (!scene || !caption) return;

        const segStart = i;
        // Image: Ken Burns — slow zoom in + slight horizontal drift.
        tl.fromTo(scene,
          { opacity: i === 0 ? 1 : 0, scale: 1.0, x: i % 2 === 0 ? -20 : 20 },
          { opacity: 1, scale: 1.08, x: i % 2 === 0 ? 20 : -20, duration: 1, ease: 'none' },
          segStart,
        );
        // Caption: fade in slightly after the image lands, fade out just before next.
        tl.fromTo(caption,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
          segStart + 0.15,
        );
        if (i < SCENES.length - 1) {
          tl.to(caption,
            { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' },
            segStart + 0.7,
          );
          // Image fades to next scene; 0.3 overlap for cross-fade.
          tl.to(scene,
            { opacity: 0, duration: 0.3, ease: 'none' },
            segStart + 0.7,
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Pinned cinematic stage (desktop + non-reduced-motion) */}
      <section
        ref={sectionRef}
        className="cinematic-hero-v2 relative hidden md:block motion-reduce:hidden"
        style={{ height: `${TOTAL_VH}vh` }}
        aria-label="مسیر سفر از ایران تا آلمان"
      >
        <div ref={stageRef} className="relative h-screen w-full overflow-hidden bg-black">
          {SCENES.map((scene, i) => (
            <div
              key={scene.id}
              ref={(el) => { sceneRefs.current[i] = el; }}
              className="absolute inset-0"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              {/* Background image — falls back to gradient if file missing.
                  next/image not used here because we want raw <img> for the
                  Ken Burns transform on the image itself (next/image wraps
                  in a fill-container that complicates transform-origin). */}
              <div className={`absolute inset-0 bg-gradient-to-br ${scene.fallbackGradient}`} aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={scene.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Dark vignette so text always reads */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.45) 100%)',
                }}
                aria-hidden="true"
              />
            </div>
          ))}

          {/* Captions — separate layer so they animate independently */}
          {SCENES.map((scene, i) => (
            <div
              key={`cap-${scene.id}`}
              ref={(el) => { captionRefs.current[i] = el; }}
              className="absolute inset-0 flex items-center justify-center px-6 text-center text-white"
              style={{ opacity: i === 0 ? 1 : 0 }}
              dir="rtl"
            >
              <div className="mx-auto max-w-2xl">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/80">
                  {scene.eyebrow}
                </p>
                <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-shadow md:text-6xl">
                  {scene.title}
                </h1>
                <p className="mt-4 text-balance text-lg leading-8 text-white/85 md:text-xl">
                  {scene.lead}
                </p>
                {scene.cta && (
                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                      href="/fa/evaluation"
                      className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-xl bg-emerald-600 px-7 text-base font-semibold text-white shadow-card transition hover:bg-emerald-500"
                    >
                      شروع ارزیابی رایگان
                    </Link>
                    <Link
                      href="/fa/how-it-works"
                      className="text-sm font-medium text-white/85 transition hover:text-white"
                    >
                      چگونه کار می‌کند؟ ↗
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Static fallback — mobile + reduced-motion */}
      <StaticHero />
    </>
  );
}

/**
 * Single-scene static version: shown on mobile and to reduced-motion
 * users. Tells the same story but without the scroll pin.
 *
 * Uses the brand scene as the canvas + the brand caption + CTAs.
 */
function StaticHero() {
  const brand = SCENES[SCENES.length - 1]!;
  return (
    <section
      className="relative block h-[80vh] min-h-[520px] w-full overflow-hidden bg-black md:hidden motion-reduce:flex motion-reduce:h-screen"
      aria-label="آلمانیار — از ترکیه تا آلمان"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${brand.fallbackGradient}`} aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brand.imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center text-white" dir="rtl">
        <div className="max-w-md">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/80">
            {brand.eyebrow}
          </p>
          <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight">
            {brand.title}
          </h1>
          <p className="mt-3 text-balance text-base leading-7 text-white/85">
            {brand.lead}
          </p>
          <div className="mt-7 flex flex-col items-center gap-3">
            <Link
              href="/fa/evaluation"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-7 text-base font-semibold text-white shadow-card transition hover:bg-emerald-500"
            >
              شروع ارزیابی رایگان
            </Link>
            <Link
              href="/fa/how-it-works"
              className="text-sm font-medium text-white/85 transition hover:text-white"
            >
              چگونه کار می‌کند؟ ↗
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
