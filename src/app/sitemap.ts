import type { MetadataRoute } from 'next';
import { localizedUrl } from '@/lib/seo';
import { defaultLocale, locales } from '@/lib/i18n';
import { PUBLIC_ROUTES } from '@/config/site-routes';
import { TOPICS } from '@/lib/germany-topics';
import { TOPIC_CONTENT } from '@/lib/topic-content';
import { resolveUpdatedAt } from '@/lib/dates';
import { prisma } from '@/lib/prisma';

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Phase-8D — published news posts + category landing pages.
  // Sitemap is regenerated on each request, so new posts surface
  // immediately without a deploy.
  const [posts, categories] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    }).catch(() => []),
    prisma.postCategory.findMany({
      select: { slug: true },
      orderBy: { order: 'asc' },
    }).catch(() => []),
  ]);

  const newsHub: MetadataRoute.Sitemap = [
    {
      url: localizedUrl(defaultLocale, '/news'),
      lastModified: posts[0]?.updatedAt ?? new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: alternates('/news'),
    },
    ...categories.map((c) => ({
      url: localizedUrl(defaultLocale, `/news/category/${c.slug}`),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      alternates: alternates(`/news/category/${c.slug}`),
    })),
  ];

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: localizedUrl(defaultLocale, `/news/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
    alternates: alternates(`/news/${p.slug}`),
  }));

  return [...main, ...topics, ...newsHub, ...postEntries];
}
