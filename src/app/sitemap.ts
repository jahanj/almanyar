import type { MetadataRoute } from 'next';
import { localizedUrl } from '@/lib/seo';
import { defaultLocale } from '@/lib/i18n';
import { TOPICS } from '@/lib/germany-topics';

/**
 * sitemap.xml — generated at /sitemap.xml.
 * Lists all public, indexable pages with priority hints. Add new public routes
 * here (and to seo-content) when they ship.
 *
 * Every URL is locale-prefixed (/fa/…) as of BUG-01.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  }[] = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/germany-visa-from-turkey', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/guide', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/exams', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/turkey-residence', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/turkey-costs', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/evaluation', priority: 0.7, changeFrequency: 'monthly' },
  ];

  const main = routes.map((r) => ({
    url: localizedUrl(defaultLocale, r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const topics = TOPICS.map((t) => ({
    url: localizedUrl(defaultLocale, t.href),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...main, ...topics];
}
