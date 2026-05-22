import { prisma } from './prisma';

export type SiteStatsView = {
  students: number | null;
  universities: number | null;
  success: number | null;
  experience: number | null;
  rating: number | null;
  reviews: number | null;
};

const EMPTY: SiteStatsView = {
  students: null, universities: null, success: null, experience: null,
  rating: null, reviews: null,
};

/**
 * Load the singleton SiteStats row and merge with the live Review aggregate.
 *
 * - SiteStats provides editable, marketing-curated numbers.
 * - The live Review aggregate (count + avg rating) ALWAYS wins when there's
 *   ≥1 approved review — we never want to under-report real reviews.
 *
 * Anything still nullish at the end stays `null`. The frontend hides the
 * corresponding UI element rather than displaying a literal zero.
 */
export async function loadSiteStats(): Promise<SiteStatsView> {
  try {
    const [row, agg] = await Promise.all([
      prisma.siteStats.findUnique({ where: { id: 1 } }),
      prisma.review.aggregate({
        where: { status: 'APPROVED' },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    const liveCount = agg._count ?? 0;
    const liveAvg = agg._avg.rating ?? null;
    const useLive = liveCount > 0;

    return {
      students:     row?.studentsCount ?? null,
      universities: row?.partnerUniversities ?? null,
      success:      row?.successRate ?? null,
      experience:   row?.yearsExperience ?? null,
      rating:       useLive ? liveAvg : row?.averageRating ?? null,
      reviews:      useLive ? liveCount : row?.reviewsCount ?? null,
    };
  } catch {
    // DB unavailable at request time — degrade to all-null so the homepage
    // simply hides the stats. Better than throwing during a render.
    return EMPTY;
  }
}

/** Helper: treats `0` as "nothing to show" (per the hide rule in BUG-03). */
export function nonZeroOrNull(value: number | null | undefined): number | null {
  return value == null || value === 0 ? null : value;
}
