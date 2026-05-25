/**
 * Single source of truth for owner-identity assets.
 *
 * The real headshot lives at `public/team/mohammad-jahanbani.jpg`.
 * Dimensions match the actual file (928×1120 portrait) so Next.js
 * reserves the right aspect-ratio space; CSS `object-cover` on the
 * about page renders it square.
 *
 * To swap the photo: drop a new file at the same path (or change
 * the filename here). `/fa/about` and Person JSON-LD both read this
 * constant, so the swap is one edit.
 */
export const OWNER_PHOTO_URL = '/team/mohammad-jahanbani.jpg';
export const OWNER_PHOTO_WIDTH = 928;
export const OWNER_PHOTO_HEIGHT = 1120;

export const OWNER = {
  fullName: 'محمد جهانبانی',
  brand: 'آلمانیار',
  jobTitle: 'مشاور مهاجرت تحصیلی',
  university: 'İstanbul Medipol Üniversitesi',
  universityUrl: 'https://www.medipol.edu.tr',
  yearsInTurkey: 6,
} as const;
