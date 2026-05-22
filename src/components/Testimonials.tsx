'use client';

import { useEffect, useState } from 'react';
import type { Dictionary } from '@/lib/i18n';
import SectionHeader from './SectionHeader';

type Review = {
  id: string;
  authorName: string;
  rating: number;
  title?: string | null;
  content: string;
  createdAt: string;
};

export default function Testimonials({
  dict,
  initialReviews,
  refreshSignal,
}: {
  dict: Dictionary;
  initialReviews: Review[];
  refreshSignal: number;
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  useEffect(() => {
    if (refreshSignal === 0) return;
    fetch('/api/reviews?limit=10')
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => {});
  }, [refreshSignal]);

  return (
    <section id="testimonials" className="section-padding bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow={dict.nav.testimonials}
          title={dict.testimonials.title}
          subtitle={dict.testimonials.subtitle}
        />

        {reviews.length === 0 ? (
          <p className="text-center text-slate-500">{dict.testimonials.empty}</p>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="card-hover flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/30 p-6 shadow-soft"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {r.authorName.charAt(0)}
                  </div>
                  <div className="text-amber-500 text-sm" aria-label={`${r.rating} از ۵`}>
                    {'★'.repeat(r.rating)}
                    <span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-slate-900">{r.authorName}</h4>
                {r.title && <h5 className="mt-1 text-sm font-medium text-slate-700">{r.title}</h5>}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                  {r.content}
                </p>
                <time className="mt-4 text-xs text-slate-400" dateTime={r.createdAt}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </time>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
