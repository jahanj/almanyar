'use client';

import { useState } from 'react';
import CinematicJourneyHero from './journey/CinematicJourneyHero';
import TrustBar from './TrustBar';
import UniversityMarquee from './UniversityMarquee';
import TrustModel from './TrustModel';
import PanelLanding from './PanelLanding';
import Services from './Services';
import Process from './Process';
import Education from './Education';
import TurkeyResidence from './TurkeyResidence';
import Testimonials from './Testimonials';
import ContactForm from './ContactForm';
import CtaBanner from './CtaBanner';
import ReviewModal from './ReviewModal';
import type { Dictionary, Locale } from '@/lib/i18n';
import type { SiteStatsView } from '@/lib/site-stats';

type Review = {
  id: string;
  authorName: string;
  rating: number;
  title?: string | null;
  content: string;
  createdAt: string;
};

export default function HomeClient({
  dict,
  locale,
  initialReviews,
  stats,
}: {
  dict: Dictionary;
  locale: Locale;
  initialReviews: Review[];
  stats: SiteStatsView;
}) {
  const [open, setOpen] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  // Reviews section visibility rule (BUG-03): hide entirely below 5 approved
  // reviews. Star rating + count individually live on the hero scene.
  const reviewsVisible = (stats.reviews ?? 0) >= 5;

  // Header and Footer are rendered by `[locale]/layout.tsx` — see BUG-05.
  return (
    <>
      <main>
        <CinematicJourneyHero
          dict={dict}
          locale={locale}
          stats={stats}
          onReviewClick={() => setOpen(true)}
        />
        <UniversityMarquee />
        <TrustBar dict={dict} />
        <TrustModel locale={locale} />
        <PanelLanding />
        <Services dict={dict} />
        <Process dict={dict} />
        <Education dict={dict} locale={locale} />
        <TurkeyResidence dict={dict} locale={locale} />
        {reviewsVisible && (
          <Testimonials dict={dict} initialReviews={initialReviews} refreshSignal={refreshSignal} />
        )}
        <CtaBanner dict={dict} locale={locale} />
        <ContactForm dict={dict} />
      </main>
      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        dict={dict}
        onSubmitted={() => setRefreshSignal((n) => n + 1)}
      />
    </>
  );
}
