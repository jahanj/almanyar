'use client';

import { useEffect, useState } from 'react';
import type { Dictionary } from '@/lib/i18n';

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
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">{dict.testimonials.title}</h2>
          <p className="text-xl text-gray-600">{dict.testimonials.subtitle}</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {reviews.length === 0 ? (
          <p className="text-center text-gray-500">{dict.testimonials.empty}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {reviews.map((r) => (
              <div key={r.id} className="review-card">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-gray-800">{r.authorName}</h4>
                  <div className="text-yellow-500">
                    {'★'.repeat(r.rating)}
                    <span className="text-gray-300">{'★'.repeat(5 - r.rating)}</span>
                  </div>
                </div>
                {r.title && <h5 className="font-semibold mb-2">{r.title}</h5>}
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{r.content}</p>
                <p className="text-xs text-gray-400 mt-3">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
