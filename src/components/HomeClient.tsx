'use client';

import { type ReactNode } from 'react';
import CinematicHeroV2 from './journey/CinematicHeroV2';
import ThreePaths from './home/ThreePaths';
import WhyAlmanYar from './home/WhyAlmanYar';
import JourneyTimeline from './home/JourneyTimeline';
import SocialProof from './home/SocialProof';
import FinalCTA from './home/FinalCTA';

/**
 * Phase-9 — homepage redesign.
 *
 * 7 sections, sharp hierarchy, conversion-focused:
 *   1. CinematicHeroV2     — scroll-pinned Ken Burns + 5 scenes
 *   2. ThreePaths          — Study / Ausbildung / Work
 *   3. WhyAlmanYar         — 4 trust pillars
 *   4. JourneyTimeline     — 6 steps Turkey → Germany → Settlement
 *   5. SocialProof         — 1 featured + 2 secondary testimonials
 *   6. {latestNewsSlot}    — 3 most recent posts (server-rendered)
 *   7. FinalCTA            — single conversion banner → /fa/evaluation
 *
 * Retired (relocated, not lost):
 *   - UniversityMarquee   → /fa/study-germany (future)
 *   - TrustBar             → covered by hero + WhyAlmanYar
 *   - TrustModel           → replaced by WhyAlmanYar
 *   - PanelLanding         → moved to /fa/about
 *   - Services             → replaced by ThreePaths
 *   - inline ContactForm   → moved to /fa/contact
 *   - DB-driven Testimonials → replaced by curated SocialProof
 *   - CtaBanner            → replaced by FinalCTA
 *
 * Header and Footer come from `[locale]/layout.tsx` (BUG-05 fix).
 */

export default function HomeClient({
  latestNewsSlot,
}: {
  latestNewsSlot?: ReactNode;
}) {
  return (
    <main>
      <CinematicHeroV2 />
      <ThreePaths />
      <WhyAlmanYar />
      <JourneyTimeline />
      <SocialProof />
      {latestNewsSlot}
      <FinalCTA />
    </main>
  );
}
