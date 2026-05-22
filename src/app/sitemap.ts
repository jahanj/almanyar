import type { MetadataRoute } from 'next';
import { localizedUrl } from '@/lib/seo';
import { defaultLocale, locales } from '@/lib/i18n';
import { PUBLIC_ROUTES } from '@/config/site-routes';
import { TOPICS } from '@/lib/germany-topics';
import { TOPIC_CONTENT } from '@/lib/topic-content';
import { resolveUpdatedAt } from '@/lib/dates';

/**
 * sitemap.xml — generated at /sitemap.xml.
 *
 * Source of truth:
 *   - src/config/site-routes.ts : explicit list of bespoke marketing pages.
 *   - src/lib/germany-topics.ts : auto-appended topic-routed slugs.
 *
 * Each entry emits an `alternates.languages` map so Next renders
 * <xhtml:link rel="alternate" hreflang="..."> per Google's i18n guidance.
 * Today only `fa` is populated — once translations land, the same routes
 * gain tr/en entries without needing edits here.
 *
 * Excludes auth/admin/api/_next (those are never in PUBLIC_ROUTES, and
 * the topic-routed pages are also under /fa).
 */

function alternates(path: string) {
  // Today there's only one locale. The map shape matches Next's
  // `MetadataRoute.Sitemap[number]['alternates']['languages']`.
  const langs: Record<string, string> = {};
  for (const l of locales) langs[l] = localizedUrl(l, path);
  langs['x-default'] = localizedUrl(defaultLocale, path);
  return { languages: langs };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const main: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((r) => ({
    url: localizedUrl(defaultLocale, r.path),
    lastModified: resolveUpdatedAt({ explicit: r.updatedAt, sourceFile: r.source }),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
    alternates: alternates(r.path),
  }));

  const topics: MetadataRoute.Sitemap = TOPICS.map((t) => {
    const content = TOPIC_CONTENT[t.href];
    return {
      url: localizedUrl(defaultLocale, t.href),
      lastModified: resolveUpdatedAt({
        explicit: content?.updatedAt,
        // Match the topic-content file the slug lives in — keys are the
        // group ("visa-services", "study", ...) we can't infer cheaply.
        // Fall back to topic-route.tsx's git lastmod, which moves whenever
        // ANY topic-content file is edited.
        sourceFile: 'src/lib/topic-route.tsx',
      }),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: alternates(t.href),
    };
  });

  return [...main, ...topics];
}
