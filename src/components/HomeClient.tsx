'use client';

import { useState, type ReactNode } from 'react';
import CinematicJourneyHero from './journey/CinematicJourneyHero';
import ReviewModal from './ReviewModal';
import ThreePaths from './home/ThreePaths';
import WhyAlmanYar from './home/WhyAlmanYar';
import JourneyTimeline from './home/JourneyTimeline';
import SocialProof from './home/SocialProof';
import FinalCTA from './home/FinalCTA';
import type { Dictionary, Locale } from '@/lib/i18n';
import type { SiteStatsView } from '@/lib/site-stats';

/**
 * Phase-9 — homepage redesign (REVISION: restored the original
 * CinematicJourneyHero per user feedback; kept the 5 new sections
 * + new /fa/contact + /fa/about update).
 *
 * Sections:
 *   1. CinematicJourneyHero (original 5-scene SVG GSAP scroll, kept)
 *   2. ThreePaths            — Study / Ausbildung / Work
 *   3. WhyAlmanYar           — 4 trust pillars
 *   4. JourneyTimeline       — 6 steps Turkey → Germany
 *   5. SocialProof           — 1 featured + 2 secondary
 *   6. {latestNewsSlot}      — 3 most recent posts (server-rendered)
 *   7. FinalCTA              — conversion banner → /fa/evaluation
 *
 * Header and Footer come from `[locale]/layout.tsx` (BUG-05 fix).
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

  return (
    <>
      <main>
        <CinematicJourneyHero
          dict={dict}
          locale={locale}
          stats={stats}
          onReviewClick={() => setOpen(true)}
        />
        <ThreePaths />
        <WhyAlmanYar />
        <JourneyTimeline />
        <SocialProof />
        {latestNewsSlot}
        <FinalCTA />
      </main>
      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        dict={dict}
        onSubmitted={() => {}}
      />
    </>
  );
}
