import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';

// POSITIONING-03 — content audit.
//
// Goal: the word "تضمین" should appear only in defensible contexts
// (negations, refusals, salary disclaimers, internal authoring guidelines).
// It must NEVER appear as a positive claim about an outcome we cannot
// actually guarantee (visa, admission, exams).
//
// This test is intentionally a static-content audit (greps the source tree)
// rather than a browser test — content lives in TS files, and we want the
// CI signal to flare on author intent, not on a rendered page.

const CONTENT_DIRS = [
  'src/lib/topic-content',
  'src/app/[locale]',
  'src/components',
];

// Lines we explicitly allow (kept after the POSITIONING-03 audit). Each must
// stay defensive. Update this list ONLY with an entry in the audit table in
// PHASE-2-REPORT.md.
const ALLOW_LIST: Array<{ file: string; substring: string; reason: string }> = [
  {
    file: 'src/lib/topic-content/types.ts',
    substring: '"تضمینی"',
    reason: 'Internal authoring guideline comment telling authors NOT to use the word.',
  },
  {
    file: 'src/lib/topic-content/visa-services.ts',
    substring: 'موفقیت صددرصد یا تضمین صدور ویزا نمی‌دهیم',
    reason: 'Negation — we refuse to guarantee visa issuance.',
  },
  {
    file: 'src/lib/topic-content/visa-services.ts',
    substring: 'هیچ مشاور یا آژانسی نمی‌تواند صدور ویزا را تضمین کند',
    reason: 'Negation — we say no one can guarantee a visa.',
  },
  {
    file: 'src/lib/topic-content/visa-services.ts',
    substring: 'آیا آلمانیار صدور ویزا را تضمین می‌کند؟',
    reason: 'FAQ question framing — the answer is an explicit "no".',
  },
  {
    file: 'src/lib/topic-content/jobs.ts',
    substring: 'این ارقام راهنما هستند نه تضمین',
    reason: 'Salary-range disclaimer — explicitly NOT a guarantee.',
  },
  {
    file: 'src/app/[locale]/germany-visa-from-turkey/page.tsx',
    substring: 'به‌تنهایی تضمین‌کننده پذیرش پرونده نیست',
    reason: 'Negation — Turkish residence alone is NOT a guarantor.',
  },
  {
    file: 'src/app/[locale]/disclaimer/page.tsx',
    substring: 'آنچه تضمین نمی‌کنیم',
    reason: 'Disclaimer meta description — "what we DO NOT guarantee".',
  },
];

function grepOccurrences(pattern: string): Array<{ file: string; line: number; text: string }> {
  const dirs = CONTENT_DIRS.map((d) => `'${d}'`).join(' ');
  const cmd = `grep -nr ${dirs} -e '${pattern}' 2>/dev/null || true`;
  const raw = execSync(cmd, { encoding: 'utf8' });
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([^:]+):(\d+):(.*)$/);
      if (!m) return null;
      return { file: m[1], line: Number(m[2]), text: m[3] };
    })
    .filter((x): x is { file: string; line: number; text: string } => x !== null);
}

test.describe('POSITIONING-03 — misleading-guarantee audit', () => {
  test('every "تضمین" occurrence is on the explicit allow list', () => {
    const matches = grepOccurrences('تضمین');
    const unexpected = matches.filter((m) => {
      return !ALLOW_LIST.some((allowed) => {
        const fileMatches = m.file.endsWith(allowed.file) || m.file === allowed.file;
        return fileMatches && m.text.includes(allowed.substring);
      });
    });
    if (unexpected.length) {
      // Surface the offending lines in the failure message so adding new
      // content that needs review is obvious.
      const detail = unexpected
        .map((m) => `  ${m.file}:${m.line}\n    ${m.text.trim()}`)
        .join('\n');
      throw new Error(
        `Found ${unexpected.length} use(s) of "تضمین" not on the allow list. ` +
        `Either rewrite the line, or — if the usage is defensive — add it to ` +
        `ALLOW_LIST in this test file with a reason.\n\n${detail}`,
      );
    }
  });

  test('no "تیم ما" self-reference (single-consultant positioning)', () => {
    const matches = grepOccurrences('تیم ما');
    expect(
      matches,
      `"تیم ما" implies a team; Almanyar is a single consultant. Use "ما" instead.\n` +
      matches.map((m) => `  ${m.file}:${m.line}`).join('\n'),
    ).toEqual([]);
  });

  // The adverbs "حتماً" / "قطعاً" / "صد در صد" are NOT inherently misleading
  // — in Persian they're often used imperatively ("be sure to check the
  // official site"), which is the opposite of an outcome guarantee. The
  // spec asked us to *review* each occurrence; the audit table in
  // PHASE-2-REPORT.md is the authoritative log. The test only flares on
  // forms that are unambiguously promise-shaped about an outcome.
  test('no promise-shaped "we guarantee X" patterns', () => {
    const patterns = [
      'صد در صد موفقیت',     // "100% success"
      'تضمین ۱۰۰',           // "100 guarantee" with Persian digits
      'گارانتی',              // loanword "garanti" — informal version
      'گرنتی',                //   alt spelling
    ];
    const all = patterns.flatMap((p) => grepOccurrences(p).map((m) => ({ ...m, pat: p })));
    expect(all, `Promise-shaped phrasing found:\n` +
      all.map((m) => `  [${m.pat}] ${m.file}:${m.line}\n    ${m.text.trim()}`).join('\n'),
    ).toEqual([]);
  });
});
