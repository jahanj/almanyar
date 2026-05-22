import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale } from './lib/i18n';

/**
 * Single-locale (`fa`) middleware.
 *
 * Public marketing pages live under `/fa/*`. Auth, dashboard, admin and API
 * routes intentionally stay un-prefixed because NextAuth callback URLs and
 * external email links are already deployed against the un-prefixed paths.
 *
 * Explicit legacy un-prefixed → /fa redirects for old SEO landing groups
 * (germany-visa, study-germany, …) are emitted by `next.config.js#redirects`
 * with status 308 so search engines transfer link equity. Everything else
 * that doesn't match a kept-un-prefixed prefix or already start with `/fa`
 * is redirected here as a catch-all.
 */

const PUBLIC_FILE = /\.(.*)$/;

// Paths that live outside the [locale] segment and must NOT be locale-prefixed.
const KEEP_UNPREFIXED = [
  '/api',
  '/_next',
  '/admin',
  '/dashboard',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/sitemap.xml',
  '/robots.txt',
  '/favicon.png',
];

// /tr and /en are reserved for future locales. 404 them now so a future code
// drop can introduce them without colliding with anything indexed in the wild.
const RESERVED_LOCALES = ['/tr', '/en'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    RESERVED_LOCALES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  if (
    KEEP_UNPREFIXED.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Already under the default locale — pass through.
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    return NextResponse.next();
  }

  // Catch-all: any other path gets the locale prefix.
  // (Explicit legacy → locale redirects live in next.config#redirects.)
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
