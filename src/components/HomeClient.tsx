'use client';

import { useState, type ReactNode } from 'react';
import CinematicJourneyHero from './journey/CinematicJourneyHero';
import TrustBar from './TrustBar';
import UniversityMarquee from './UniversityMarquee';
import TrustModel from './TrustModel';
import PanelLanding from './PanelLanding';
import Services from './Services';
import ContactForm from './ContactForm';
import CtaBanner from './CtaBanner';
import ReviewModal from './ReviewModal';
import type { Dictionary, Locale } from '@/lib/i18n';
import type { SiteStatsView } from '@/lib/site-stats';

/**
 * Phase-8F — homepage trim.
 *
 * Removed: Process, Education, TurkeyResidence, Testimonials.
 * Each section's content still lives on its dedicated hub page:
 *   - Process       → /fa/how-it-works
 *   - Education     → /fa/study-germany
 *   - TurkeyResidence → /fa/turkey-residence
 *   - Testimonials  → kept as data in DB; the hero scene still shows
 *                     star rating + count, so social proof remains.
 *
 * Added: `latestNewsSlot` — a server-rendered "Latest news" strip
 * passed in as a slot so we don't have to fetch Prisma data inside
 * a `'use client'` boundary. Sits between Services and CtaBanner.
 */

export default function HomeClient({
  dict,
  locale,
  stats,
  latestNewsSlot,
}: {
  dict: Dictionary;
  locale: Locale;
  stats: SiteStatsView;
  latestNewsSlot?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

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
        {latestNewsSlot}
        <CtaBanner dict={dict} locale={locale} />
        <ContactForm dict={dict} />
      </main>
      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        dict={dict}
        // Testimonials section is gone; nothing to re-fetch on submit.
        onSubmitted={() => {}}
      />
    </>
  );
}
