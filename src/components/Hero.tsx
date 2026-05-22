'use client';

import Link from 'next/link';
import Counter from './Counter';
import type { Dictionary, Locale } from '@/lib/i18n';
import { localePath } from '@/lib/i18n';

const statItems = [
  { key: 'students' as const, target: 500 },
  { key: 'universities' as const, target: 50 },
  { key: 'success' as const, target: 95 },
  { key: 'experience' as const, target: 5 },
];

export default function Hero({
  dict,
  locale,
  averageRating,
  totalReviews,
  onReviewClick,
}: {
  dict: Dictionary;
  locale: Locale;
  averageRating: number;
  totalReviews: number;
  onReviewClick: () => void;
}) {
  return (
    <section className="relative overflow-hidden bg-slate-50 pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="absolute inset-0 bg-mesh-hero" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-grid-pattern bg-grid opacity-60"
        aria-hidden="true"
      />
      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/80 px-4 py-1.5 text-sm font-medium text-brand-800 shadow-soft backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
            </span>
            {dict.hero.stats.students}+ · {dict.hero.stats.experience}
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-[3.25rem] lg:leading-[1.15]">
            <span className="gradient-text">{dict.hero.title}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg md:leading-8">
            {dict.hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="#contact"
              className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 sm:w-auto"
            >
              {dict.hero.ctaConsult}
            </a>
            <a
              href="#process"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-800 shadow-soft transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
            >
              {dict.hero.ctaProcess}
            </a>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
          {statItems.map(({ key, target }) => (
            <div
              key={key}
              className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-center shadow-soft backdrop-blur-sm"
            >
              <div className="text-2xl font-bold text-slate-900 md:text-3xl">
                <Counter target={target} />
                {key === 'success' && <span className="text-lg text-brand-600">%</span>}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-500 md:text-sm">
                {dict.hero.stats[key]}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-6 shadow-soft">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-start">
              <div className="text-4xl font-bold text-amber-600">{averageRating.toFixed(1)}</div>
              <div className="mt-1 flex justify-center gap-0.5 text-amber-500 sm:justify-start">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-lg">
                    {i <= Math.round(averageRating) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-sm font-medium text-slate-600">
                {dict.hero.basedOn.replace('{n}', String(totalReviews))}
              </p>
            </div>
            <button
              type="button"
              onClick={onReviewClick}
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-soft transition hover:border-brand-300 hover:text-brand-700"
            >
              {dict.hero.writeReview}
            </button>
          </div>
        </div>

        <div className="mx-auto mt-12 hidden max-w-5xl lg:block">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
            <div className="grid grid-cols-3 divide-x divide-slate-100 rtl:divide-x-reverse">
              {[
                { step: '01', label: dict.nav.evaluation, href: localePath(locale, '/evaluation') },
                { step: '02', label: dict.nav.process, href: localePath(locale, '#process') },
                { step: '03', label: dict.nav.contact, href: localePath(locale, '#contact') },
              ].map((item) => (
                <Link
                  key={item.step}
                  href={item.href}
                  className="group flex items-center gap-4 px-6 py-5 transition hover:bg-slate-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                    {item.step}
                  </span>
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-700">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
