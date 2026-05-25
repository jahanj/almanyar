/**
 * Persian-safe slug helper.
 *
 * - Keeps Persian/Arabic letters as-is (Google + Bing handle non-ASCII
 *   slugs cleanly; %-encoded URLs read fine in Persian browsers).
 * - Normalises whitespace + dashes.
 * - Strips zero-width characters and punctuation that would noise the URL.
 * - Forces lowercase for Latin chars; Persian has no case.
 *
 * If you want a Latin-only slug (e.g. "germany-embassy" instead of
 * "سفارت-آلمان") just type it in the admin form — this helper is only
 * the auto-suggestion from the title.
 */
export function slugify(input: string): string {
  return input
    // strip zero-width + bidi formatting chars that sneak in from RTL input
    .replace(/[​-‏‪-‮﻿]/g, '')
    .trim()
    .toLowerCase()
    // collapse whitespace runs to single space
    .replace(/\s+/g, ' ')
    // drop characters we never want in a URL slug
    .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~،؛؟»«]/g, '')
    // spaces and underscores → single dash
    .replace(/[\s_]+/g, '-')
    // collapse repeated dashes
    .replace(/-+/g, '-')
    // trim dashes from ends
    .replace(/^-+|-+$/g, '');
}
