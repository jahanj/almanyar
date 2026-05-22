import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

/**
 * robots.txt — generated at /robots.txt.
 *
 * Production:    public marketing pages indexable; auth/admin/api blocked.
 * Anywhere else: full-site Disallow so staging/preview deploys never get
 *                indexed accidentally.
 *
 * The gate uses `!== 'production'` (not `=== 'staging'`) — that way any
 * unset / mistyped env defaults to the safe path. See PHASE-2-PLAN §2.5
 * and decision D.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';

  if (!isProduction) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      host: SITE.url,
    };
  }

  const disallow = [
    '/api/',
    '/admin',
    '/dashboard',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ];

  return {
    rules: [
      // Default + major search and AI crawlers. We explicitly welcome them.
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
