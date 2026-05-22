import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale } from './lib/i18n';

const PUBLIC_FILE = /\.(.*)$/;

// Routes that live outside the [locale] segment and must not be locale-redirected.
const NON_LOCALIZED_PREFIXES = [
  '/api',
  '/_next',
  '/admin',
  '/dashboard',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/germany-visa-from-turkey',
  // Root-level SEO landing segments (دانستنی‌های کاربردی آلمان).
  '/germany-visa',
  '/germany-embassy',
  '/study-germany',
  '/work-germany',
  '/jobs-germany',
  '/life-germany',
  '/services',
  '/faq',
  '/ausbildung',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === `/${defaultLocale}/germany-visa-from-turkey`) {
    request.nextUrl.pathname = '/germany-visa-from-turkey';
    return NextResponse.redirect(request.nextUrl, 308);
  }

  if (
    NON_LOCALIZED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    // Exam topic pages (/exams/dsh …) are root-level, but bare /exams redirects to /fa/exams.
    pathname.startsWith('/exams/') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Persian-only site: anything already under /fa passes through; everything else
  // is redirected to its /fa equivalent.
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    return NextResponse.next();
  }

  request.nextUrl.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
