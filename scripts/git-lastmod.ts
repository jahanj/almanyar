/* eslint-disable no-console */
/**
 * Walks every TS/TSX file under src/lib/topic-content + src/app/[locale]
 * + src/config/site-routes.ts and writes a manifest of {file: lastCommitISO}
 * to src/lib/.git-lastmod.json.
 *
 * Consumed by src/lib/dates.ts: when a content block has no explicit
 * updatedAt, we look up its source file here for the dateModified
 * fallback (Phase-2 plan §SEO-06).
 *
 * Runs at build time inside the Docker builder stage, so the manifest
 * is baked into the standalone bundle and the running container never
 * needs the .git directory.
 *
 * Failure mode: if `git log` fails (e.g. someone built from a tarball
 * without .git), the script writes an empty manifest and the runtime
 * fallback chain drops to PHASE_1_SEO_FILL_DATE.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(__dirname, '..');
const OUT  = join(ROOT, 'src/lib/.git-lastmod.json');

// Skip entirely when the build context has no .git directory (typical inside
// the Docker builder stage where .dockerignore excludes .git). Leave any
// existing manifest in place — it was already shipped via rsync.
if (!existsSync(join(ROOT, '.git'))) {
  if (!existsSync(OUT)) writeFileSync(OUT, '{}');
  console.log('• git-lastmod: no .git in context — keeping existing manifest');
  process.exit(0);
}

const SCAN_DIRS = [
  'src/app/[locale]',
  'src/lib/topic-content',
  'src/config',
];

function walk(dir: string, acc: string[] = []): string[] {
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return acc; }
  for (const name of entries) {
    const p = join(dir, name);
    let stat;
    try { stat = statSync(p); } catch { continue; }
    if (stat.isDirectory()) walk(p, acc);
    else if (stat.isFile() && /\.(tsx?|mdx?)$/.test(name)) acc.push(p);
  }
  return acc;
}

function lastCommitISO(absPath: string): string | undefined {
  try {
    const stdout = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', absPath],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return stdout || undefined;
  } catch {
    return undefined;
  }
}

const manifest: Record<string, string> = {};
const allFiles = SCAN_DIRS.flatMap((d) => walk(resolve(ROOT, d)));

for (const abs of allFiles) {
  const rel = relative(ROOT, abs);
  const iso = lastCommitISO(abs);
  if (iso) manifest[rel] = iso.slice(0, 10); // keep YYYY-MM-DD only
}

mkdirSync(resolve(OUT, '..'), { recursive: true });
writeFileSync(OUT, JSON.stringify(manifest, null, 2));
console.log(`✓ git-lastmod manifest: ${Object.keys(manifest).length} file(s) → ${relative(ROOT, OUT)}`);
