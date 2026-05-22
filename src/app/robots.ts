import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

/**
 * robots.txt — generated at /robots.txt.
 * Allows general + AI crawlers (GEO/AI-search) and the whole public site,
 * while keeping private/auth/app areas out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/api/', '/admin', '/dashboard', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

  return {
    rules: [
      // Default + major search and AI crawlers (Google-Extended, GPTBot, ClaudeBot,
      // PerplexityBot, etc. all match '*' unless overridden) — we explicitly welcome them.
      { userAgent: '*', allow: '/', disallow },
      { userAgent: 'Googlebot', allow: '/', disallow },
      { userAgent: 'Google-Extended', allow: '/', disallow },
      { userAgent: 'GPTBot', allow: '/', disallow },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow },
      { userAgent: 'ChatGPT-User', allow: '/', disallow },
      { userAgent: 'ClaudeBot', allow: '/', disallow },
      { userAgent: 'Claude-Web', allow: '/', disallow },
      { userAgent: 'PerplexityBot', allow: '/', disallow },
      { userAgent: 'Google-CloudVertexBot', allow: '/', disallow },
      { userAgent: 'Bingbot', allow: '/', disallow },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
