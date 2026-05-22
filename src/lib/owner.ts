/**
 * Single source of truth for owner-identity assets.
 *
 * When the real photo arrives (watermark removed):
 *   1. Drop the file at `public/team/mohammad-jahanbani.jpg`
 *      (or .webp / .png — any format `next/image` accepts).
 *   2. Change `OWNER_PHOTO_URL` below to the new filename.
 *   3. That's it. The `/fa/about` page and Person JSON-LD both
 *      read from this constant, so the swap is a single edit.
 *
 * Keep the dimensions at 800×800 so the layout doesn't shift.
 */
export const OWNER_PHOTO_URL = '/team/mohammad-jahanbani-placeholder.svg';
export const OWNER_PHOTO_WIDTH = 800;
export const OWNER_PHOTO_HEIGHT = 800;

export const OWNER = {
  fullName: 'محمد جهانبانی',
  brand: 'آلمانیار',
  jobTitle: 'مشاور مهاجرت تحصیلی',
  university: 'İstanbul Medipol Üniversitesi',
  universityUrl: 'https://www.medipol.edu.tr',
  yearsInTurkey: 6,
} as const;
