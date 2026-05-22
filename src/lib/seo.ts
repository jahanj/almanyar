import type { Metadata } from 'next';
import { locales, defaultLocale, type Locale } from './i18n';
import { truncateDescription } from './truncate';

/**
 * Central SEO configuration and helpers.
 *
 * Single source of truth for the canonical origin, social profiles and the
 * reusable metadata / JSON-LD builders used across every page. Keeping this in
 * one place makes the SEO system scalable: new pages call `pageMetadata()` and
 * drop in the relevant JSON-LD builder, and stay consistent automatically.
 */

export const SITE = {
  // Canonical production origin. Override via NEXT_PUBLIC_SITE_URL if it ever moves.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://almanyar.com').replace(/\/$/, ''),
  name: 'آلمانیار',
  brandLatin: 'AlmanYar',
  twitter: '@almanyar',
  // Logos / default share image live in /public.
  logo: '/logo.png',
  ogImage: '/og.png',
  // Public social profiles — used for Organization `sameAs`. Add real URLs as they go live.
  social: [
    'https://instagram.com/almanyar',
    'https://t.me/almanyar',
  ],
  phone: '+90 506 770 8295',
  email: 'info@almanyar.com',
} as const;

/** hreflang code for each app locale. */
export const HREFLANG: Record<Locale, string> = { fa: 'fa' };

/** OpenGraph `locale` value for each app locale. */
export const OG_LOCALE: Record<Locale, string> = { fa: 'fa_IR' };

/** Absolute URL for a path on the canonical origin. */
export function absoluteUrl(path = ''): string {
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Localized absolute URL, e.g. localizedUrl('fa', '/guide') -> https://almanyar.com/fa/guide */
export function localizedUrl(locale: Locale, path = ''): string {
  const clean = path === '/' ? '' : path;
  return absoluteUrl(`/${locale}${clean}`);
}

/** Builds the hreflang alternates map (all locales + x-default) for a page path. */
function languageAlternates(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of locales) map[HREFLANG[l]] = localizedUrl(l, path);
  map['x-default'] = localizedUrl(defaultLocale, path);
  return map;
}

type PageMetaInput = {
  locale: Locale;
  /** Path WITHOUT the locale prefix. '' or '/' for the locale home, '/guide' for a sub-page. */
  path?: string;
  title: string;
  description: string;
  /** 'website' (default) or 'article'. */
  type?: 'website' | 'article';
  /** Override the share image (absolute path under /public). */
  image?: string;
  /** Set true on pages that must not be indexed. */
  noindex?: boolean;
};

/**
 * Builds a complete, consistent Next.js Metadata object for a page:
 * title, description, canonical, hreflang alternates, Open Graph and Twitter cards.
 *
 * Intentionally does not emit a `keywords` field: Google deprecated the
 * `<meta name="keywords">` signal in 2009 and the other major engines followed.
 */
export function pageMetadata(input: PageMetaInput): Metadata {
  const { locale, path = '', title, description, type = 'website', image, noindex } = input;
  const safeDescription = truncateDescription(description);
  const canonical = localizedUrl(locale, path);
  const ogImage = absoluteUrl(image ?? SITE.ogImage);

  return {
    title,
    description: safeDescription,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
        },
    openGraph: {
      type,
      url: canonical,
      siteName: SITE.name,
      title,
      description: safeDescription,
      locale: OG_LOCALE[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: safeDescription,
      images: [ogImage],
      site: SITE.twitter,
    },
  };
}

/**
 * Metadata for ROOT-level SEO landing pages (e.g. /germany-visa) that live
 * outside the /fa locale segment. Canonical points at the bare path.
 *
 * Kept for the (shrinking) set of pages still served from the root path during
 * the BUG-01 migration. Once those pages move under /[locale], delete this and
 * call `pageMetadata` everywhere.
 */
export function rootPageMetadata(input: {
  path: string;
  title: string;
  description: string;
  type?: 'website' | 'article';
}): Metadata {
  const { path, title, description, type = 'article' } = input;
  const safeDescription = truncateDescription(description);
  const canonical = absoluteUrl(path);
  const ogImage = absoluteUrl(SITE.ogImage);
  return {
    title,
    description: safeDescription,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    openGraph: {
      type,
      url: canonical,
      siteName: SITE.name,
      title,
      description: safeDescription,
      locale: 'fa_IR',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description: safeDescription, images: [ogImage], site: SITE.twitter },
  };
}

/* ─────────────────────────  JSON-LD builders  ───────────────────────── */

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: SITE.brandLatin,
    url: SITE.url,
    logo: absoluteUrl(SITE.logo),
    image: absoluteUrl(SITE.ogImage),
    email: SITE.email,
    telephone: SITE.phone,
    description: 'خدمات تخصصی مهاجرت تحصیلی به آلمان از مسیر ترکیه؛ اقامت تحصیلی، انتخاب دانشگاه و اخذ ویزای دانشجویی.',
    areaServed: ['IR', 'TR', 'DE'],
    sameAs: SITE.social,
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: ['fa', 'tr', 'de'],
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

/** Professional service offered — strengthens entity understanding for AI/Google. */
export function serviceLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE.name,
    url: localizedUrl(locale),
    image: absoluteUrl(SITE.ogImage),
    priceRange: '$$',
    areaServed: ['IR', 'TR', 'DE'],
    serviceType: 'مشاوره مهاجرت تحصیلی به آلمان و ثبت‌نام آزمون‌های زبان آلمانی',
    description:
      'خدمات آلمانیار شامل انتخاب دانشگاه، آماده‌سازی مدارک، ثبت‌نام آزمون گوته، telc، TestDaF، TestAS و ÖSD، درخواست ویزا، حساب مسدودشده، بیمه و همراهی پس از ورود به آلمان است.',
    provider: { '@id': `${SITE.url}/#organization` },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'خدمات مهاجرت تحصیلی آلمانیار',
      itemListElement: [
        'انتخاب دانشگاه و رشته',
        'تهیه و ترجمه مدارک',
        'ثبت‌نام آزمون گوته',
        'ثبت‌نام آزمون telc',
        'ثبت‌نام TestDaF',
        'ثبت‌نام TestAS',
        'درخواست ویزای تحصیلی آلمان',
        'افتتاح حساب مسدود شده',
        'بیمه درمانی دانشجویی',
        'یافتن خانه در آلمان',
      ].map((name) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name,
        },
      })),
    },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

export function articleLd(input: {
  locale: Locale;
  path: string;
  headline: string;
  description: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    inLanguage: HREFLANG[input.locale],
    image: absoluteUrl(input.image ?? SITE.ogImage),
    mainEntityOfPage: localizedUrl(input.locale, input.path),
    author: { '@id': `${SITE.url}/#organization` },
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}
