import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';

/**
 * TRUST-11 — single-consultant audit.
 *
 * Almanyar is operated by ONE person (Mohammad Jahanbani). Copy that
 * implies a team or company is structurally untruthful.
 *
 * Phase-2 POSITIONING-03 already removed the only "تیم ما" hit. Phase-3
 * extends the audit to:
 *  - "تیم ما"          / "our team"
 *  - "شرکت ما"         / "our company"
 *  - "کارشناسان ما"     / "our experts"
 *  - "متخصصان ما"      / "our specialists"
 *
 * As with the Phase-2 audit, a strict allow-list lets reviewers
 * intentionally keep an occurrence (e.g. a quote, a defensive negation)
 * by adding it here with a written reason.
 */

const CONTENT_DIRS = ['src/lib/topic-content', 'src/app/[locale]', 'src/components'];

const ALLOW_LIST: Array<{ file: string; substring: string; reason: string }> = [
  // (none today — every prior match was a self-reference; all rewritten)
];

function grepOccurrences(pattern: string) {
  const dirs = CONTENT_DIRS.map((d) => `'${d}'`).join(' ');
  const cmd = `grep -nr ${dirs} -e '${pattern}' 2>/dev/null || true`;
  const raw = execSync(cmd, { encoding: 'utf8' });
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([^:]+):(\d+):(.*)$/);
      return m ? { file: m[1], line: Number(m[2]), text: m[3], pattern } : null;
    })
    .filter((x): x is { file: string; line: number; text: string; pattern: string } => x !== null);
}

test.describe('TRUST-11 — single-consultant audit', () => {
  test('no team/company self-references ("تیم ما" / "شرکت ما" / "کارشناسان ما" / "متخصصان ما")', () => {
    const patterns = ['تیم ما', 'شرکت ما', 'کارشناسان ما', 'متخصصان ما'];
    const all = patterns.flatMap((p) => grepOccurrences(p));

    const unexpected = all.filter((m) => {
      return !ALLOW_LIST.some((entry) => {
        const fileMatches = m.file.endsWith(entry.file) || m.file === entry.file;
        return fileMatches && m.text.includes(entry.substring);
      });
    });

    if (unexpected.length) {
      const detail = unexpected
        .map((m) => `  [${m.pattern}] ${m.file}:${m.line}\n    ${m.text.trim()}`)
        .join('\n');
      throw new Error(
        `Found ${unexpected.length} self-reference(s) implying a team/company. ` +
        `Almanyar is operated by a single consultant. Rewrite each line to "من" / "ما" / "آلمانیار", ` +
        `or — if the usage is intentional + defensible — add it to ALLOW_LIST with a reason.\n\n${detail}`,
      );
    }
  });
});
