/* eslint-disable no-console */
/**
 * Crawls every route exposed by /sitemap.xml on the running dev/prod server
 * and reports SEO meta issues.
 *
 * Run:
 *   PLAYWRIGHT_BASE_URL=https://almanyar.com npx tsx scripts/audit-meta.ts
 * or:
 *   AUDIT_URL=http://127.0.0.1:3000 npx tsx scripts/audit-meta.ts
 *
 * Exits non-zero if any issue is found — wire into Docker build to gate ships.
 */

const BASE = process.env.AUDIT_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const MAX_DESC = 160;

type Issue = { url: string; kind: string; detail: string };

function attr(html: string, name: 'name' | 'property', value: string): string | undefined {
  // Match <meta {name|property}="value" content="..."> — both attribute orderings.
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const a = new RegExp(`<meta[^>]*${name}=["']${escaped}["'][^>]*content=["']([^"']*)["']`, 'i');
  const b = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${name}=["']${escaped}["']`, 'i');
  return html.match(a)?.[1] ?? html.match(b)?.[1];
}

function endsMidWord(text: string): boolean {
  // True if the last character is a Persian letter, a letter, or a digit
  // (i.e. NOT punctuation/whitespace/quote). Implies a hard cut.
  const last = text.trim().slice(-1);
  return /[؀-ۿA-Za-z0-9]/.test(last);
}

async function listUrls(): Promise<string[]> {
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml -> ${res.status}`);
  const xml = await res.text();
  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
  // Plus the bare root.
  return Array.from(new Set([BASE, ...urls]));
}

async function audit(url: string): Promise<Issue[]> {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) return [{ url, kind: 'http', detail: `status ${res.status}` }];
  const html = await res.text();
  const out: Issue[] = [];

  const desc = attr(html, 'name', 'description');
  if (!desc || desc.trim().length === 0) {
    out.push({ url, kind: 'desc-missing', detail: 'no <meta name="description"> or empty' });
  } else {
    if (desc.length > MAX_DESC) out.push({ url, kind: 'desc-too-long', detail: `${desc.length} > ${MAX_DESC}` });
    if (endsMidWord(desc)) out.push({ url, kind: 'desc-mid-word', detail: `…${desc.slice(-24)}` });
  }

  if (attr(html, 'name', 'keywords') !== undefined) {
    out.push({ url, kind: 'keywords-present', detail: '<meta name="keywords"> must be removed (Google ignores since 2009)' });
  }

  return out;
}

async function main() {
  const urls = await listUrls();
  console.log(`Auditing ${urls.length} URL(s) at ${BASE}…`);
  const issues: Issue[] = [];
  for (const u of urls) {
    issues.push(...(await audit(u)));
  }
  if (issues.length === 0) {
    console.log(`✓ all ${urls.length} URL(s) clean — no SEO meta issues`);
    return;
  }
  console.log(`✗ ${issues.length} issue(s) found:`);
  for (const i of issues) console.log(`  [${i.kind}] ${i.url} — ${i.detail}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
