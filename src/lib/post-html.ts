/**
 * Phase-8B — plain-text → HTML helper, used until the TipTap editor
 * lands in Phase 8C. Once TipTap is wired, posts authored before that
 * still render via the same `bodyHtml` field, so this helper stays
 * useful as a fallback for plain-text-only authoring.
 *
 * Splits on blank lines → <p>, single newlines → <br/>. Escapes HTML
 * special chars (admin authors are trusted but we still avoid silent
 * tag injection — the editor in 8C will use TipTap's safe serializer).
 */
export function plainTextToHtml(text: string): string {
  const safe = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const blocks = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length === 0) return '';

  return blocks
    .map((b) => `<p>${safe(b).replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}
