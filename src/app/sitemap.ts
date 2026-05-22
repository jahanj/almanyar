import type { MetadataRoute } from 'next';
import { absoluteUrl, localizedUrl } from '@/lib/seo';
import { defaultLocale } from '@/lib/i18n';
import { TOPICS } from '@/lib/germany-topics';

/**
 * sitemap.xml — generated at /sitemap.xml.
 * Lists all public, indexable pages with priority hints. Add new public routes
 * here (and to seo-content) when they ship.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; direct?: boolean }[] = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/germany-visa-from-turkey', priority: 0.9, changeFrequency: 'monthly', direct: true },
    { path: '/guide', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/exams', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/turkey-residence', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/turkey-costs', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/evaluation', priority: 0.7, changeFrequency: 'monthly' },
  ];

  const main = routes.map((r) => ({
    url: r.direct ? absoluteUrl(r.path) : localizedUrl(defaultLocale, r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Root-level SEO landing pages (دانستنی‌های کاربردی آلمان).
  const topics = TOPICS.map((t) => ({
    url: absoluteUrl(t.href),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...main, ...topics];
}
