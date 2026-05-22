/**
 * Description-safe truncation:
 *  - collapses whitespace
 *  - if the text fits, returns it unchanged
 *  - otherwise cuts at the last whitespace at or before `max`, strips
 *    trailing punctuation/quotes, and appends a single period
 *
 * Persian punctuation (، ؛ : « » … ?) and ASCII punctuation are stripped from
 * the tail so we never end on a hanging comma. Returning <= max chars total
 * (including the appended period) is the caller's guarantee.
 */
export function truncateDescription(input: string, max = 155): string {
  const text = input.replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;

  // Slice to the last whitespace boundary at or before `max - 1` so we have
  // room for the appended period.
  const window = text.slice(0, max - 1);
  const cut = window.lastIndexOf(' ');
  const truncated = (cut > 0 ? window.slice(0, cut) : window)
    .replace(/[\s.,،؛:!?\-—…«»"']+$/u, '');

  return truncated + '.';
}

/** Title companion: collapse + hard cut at the last whitespace. No appended period. */
export function truncateTitle(input: string, max = 60): string {
  const text = input.replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const window = text.slice(0, max);
  const cut = window.lastIndexOf(' ');
  return (cut > 0 ? window.slice(0, cut) : window).replace(/[\s.,،؛:!?\-—…«»"']+$/u, '');
}
