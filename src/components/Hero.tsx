'use client';

import Counter from './Counter';
import type { Dictionary } from '@/lib/i18n';

export default function Hero({
  dict,
  averageRating,
  totalReviews,
  onReviewClick,
}: {
  dict: Dictionary;
  averageRating: number;
  totalReviews: number;
  onReviewClick: () => void;
}) {
  return (
    <section className="flag-bg text-white section-padding mt-20">
      <div className="container mx-auto px-6 text-center">
        <div className="floating-animation">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow">{dict.hero.title}</h1>
        </div>
        <p className="text-lg md:text-xl mb-8 max-w-4xl mx-auto">{dict.hero.subtitle}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="glass-effect rounded-xl p-6">
            <div className="text-3xl font-bold"><Counter target={500} /></div>
            <div className="text-sm">{dict.hero.stats.students}</div>
          </div>
          <div className="glass-effect rounded-xl p-6">
            <div className="text-3xl font-bold"><Counter target={50} /></div>
            <div className="text-sm">{dict.hero.stats.universities}</div>
          </div>
          <div className="glass-effect rounded-xl p-6">
            <div className="text-3xl font-bold"><Counter target={95} /></div>
            <div className="text-sm">{dict.hero.stats.success}</div>
          </div>
          <div className="glass-effect rounded-xl p-6">
            <div className="text-3xl font-bold"><Counter target={5} /></div>
            <div className="text-sm">{dict.hero.stats.experience}</div>
          </div>
        </div>

        <div className="rating-summary max-w-md mx-auto mb-8 text-gray-800">
          <div className="text-5xl font-bold text-yellow-600 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2 text-yellow-500 text-2xl">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i}>{i <= Math.round(averageRating) ? '★' : '☆'}</span>
            ))}
          </div>
          <p className="font-medium">{dict.hero.basedOn.replace('{n}', String(totalReviews))}</p>
          <button
            onClick={onReviewClick}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition"
          >
            {dict.hero.writeReview}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-10 rounded-xl transition transform hover:scale-105 shadow-lg"
          >
            {dict.hero.ctaConsult}
          </a>
          <a
            href="#process"
            className="glass-effect hover:bg-white/20 font-bold py-4 px-10 rounded-xl transition transform hover:scale-105"
          >
            {dict.hero.ctaProcess}
          </a>
        </div>
      </div>
    </section>
  );
}
