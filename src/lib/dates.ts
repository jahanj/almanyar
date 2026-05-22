import { PHASE_1_SEO_FILL_DATE } from '@/config/site-routes';
// Generated at build time by `npx tsx scripts/git-lastmod.ts`.
// In the standalone bundle this resolves to a static JSON map.
import gitLastmod from './.git-lastmod.json';

const lastmod = gitLastmod as Record<string, string>;

/**
 * Picks the "last updated" date for a content unit, per PHASE-2-PLAN §SEO-06:
 *   1. explicit ISO date (author-controlled) — highest priority
 *   2. git lastmod of the source file (build-time manifest)
 *   3. PHASE_1_SEO_FILL_DATE (final fallback)
 *
 * `sourceFile` is a repo-relative path; matches a key in .git-lastmod.json.
 */
export function resolveUpdatedAt(input: { explicit?: string; sourceFile?: string }): string {
  if (input.explicit && /^\d{4}-\d{2}-\d{2}/.test(input.explicit)) {
    return input.explicit.slice(0, 10);
  }
  if (input.sourceFile && lastmod[input.sourceFile]) {
    return lastmod[input.sourceFile];
  }
  return PHASE_1_SEO_FILL_DATE;
}

/**
 * Format an ISO date as a Jalali (Persian) calendar string.
 *   "2026-05-22" → "۲ خرداد ۱۴۰۵"
 *
 * Uses the Intl API with `fa-IR-u-ca-persian` — no extra dependency.
 */
const jalaliFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatJalali(iso: string): string {
  // Anchor to noon UTC so DST / timezone math can't flip the day.
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  return jalaliFormatter.format(d);
}
