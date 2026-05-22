/**
 * Single registry of every public, indexable route on the site. Source of
 * truth for the dynamic sitemap (src/app/sitemap.ts) and the route-aware
 * "last updated" helper (src/lib/dates.ts).
 *
 * Topic-routed pages (TOPICS in lib/germany-topics.ts) are appended at
 * runtime — do NOT list each topic here.
 *
 * Adding a new public marketing page → add a row here. Adding an admin /
 * auth / api route → DO NOT add it here (it must stay out of sitemap.xml
 * + robots).
 */
import type { MetadataRoute } from 'next';

export type PublicRoute = {
  /** Locale-relative path; '' is the home. */
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  /** ISO date string. Optional — falls back to git lastmod via the build
   *  script, then to the Phase-1 SEO fill date as final fallback. */
  updatedAt?: string;
  /** Source file relative to repo root — used by the git-lastmod fallback
   *  to find the right commit timestamp. */
  source?: string;
};

export const PUBLIC_ROUTES: PublicRoute[] = [
  { path: '',                            priority: 1.0, changeFrequency: 'weekly',  source: 'src/app/[locale]/page.tsx' },
  { path: '/guide',                      priority: 0.9, changeFrequency: 'monthly', source: 'src/app/[locale]/guide/page.tsx' },
  { path: '/exams',                      priority: 0.9, changeFrequency: 'monthly', source: 'src/app/[locale]/exams/page.tsx' },
  { path: '/germany-visa-from-turkey',   priority: 0.9, changeFrequency: 'monthly', source: 'src/app/[locale]/germany-visa-from-turkey/page.tsx' },
  { path: '/turkey-residence',           priority: 0.8, changeFrequency: 'monthly', source: 'src/app/[locale]/turkey-residence/page.tsx' },
  { path: '/turkey-costs',               priority: 0.8, changeFrequency: 'monthly', source: 'src/app/[locale]/turkey-costs/page.tsx' },
  { path: '/evaluation',                 priority: 0.7, changeFrequency: 'monthly', source: 'src/app/[locale]/evaluation/page.tsx' },
  { path: '/how-it-works',               priority: 0.8, changeFrequency: 'yearly',  source: 'src/lib/positioning-content.ts' },
  { path: '/disclaimer',                 priority: 0.3, changeFrequency: 'yearly',  source: 'src/lib/legal-content.ts' },
  { path: '/privacy',                    priority: 0.3, changeFrequency: 'yearly',  source: 'src/lib/legal-content.ts' },
];

/** Final-fallback "last updated" date when neither explicit `updatedAt`
 *  nor the git-lastmod build artifact is available. */
export const PHASE_1_SEO_FILL_DATE = '2026-05-22';
