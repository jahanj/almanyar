import type { Metadata } from 'next';
import { locales, defaultLocale, type Locale } from './i18n';
import { truncateDescription } from './truncate';
import { OWNER, OWNER_PHOTO_URL } from './owner';

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
  // Public social profiles — fed into Person.sameAs for entity-resolution
  // (Google + AI engines use these to confirm the entity behind the site).
  // Keep canonical profile URLs only — strip tracking params (utm_*, etc.).
  social: [
    'https://www.linkedin.com/in/mohammad-hossein-jahanbani-54802b334',
  ] as string[],
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

/**
 * Builds the hreflang alternates map for a page path.
 *
 * `extraLocales` lets an individual page declare additional language
 * versions once translations exist (e.g. `['tr', 'en']`). Default emits
 * only the populated `locales` array + `x-default`. We don't emit broken
 * hreflang links for locales that don't yet have content (Google flags
 * them as 404 in Search Console).
 */
function languageAlternates(path: string, extraLocales: readonly string[] = []): Record<string, string> {
  const map: Record<string, string> = {};
  // Hardcoded `fa` for now (the only populated locale). When real
  // translation locales land, add them to `locales` in lib/i18n.ts.
  for (const l of locales) map[HREFLANG[l]] = localizedUrl(l, path);
  // Forward-compat: pages with translated versions append themselves here.
  for (const code of extraLocales) {
    // The URL still uses the locale segment — same path, different prefix.
    // Cast: `code` is a known language tag string at the point a page calls this.
    map[code] = `${SITE.url}/${code}${path === '/' ? '' : path}`;
  }
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
  /** Languages this page has been translated into (in addition to the
   *  default Persian). Emits hreflang links only when content exists at
   *  the corresponding URL. Default: []. */
  translatedLocales?: readonly string[];
};

/**
 * Builds a complete, consistent Next.js Metadata object for a page:
 * title, description, canonical, hreflang alternates, Open Graph and Twitter cards.
 *
 * Intentionally does not emit a `keywords` field: Google deprecated the
 * `<meta name="keywords">` signal in 2009 and the other major engines followed.
 */
export function pageMetadata(input: PageMetaInput): Metadata {
  const { locale, path = '', title, description, type = 'website', image, noindex, translatedLocales } = input;
  const safeDescription = truncateDescription(description);
  const canonical = localizedUrl(locale, path);
  const ogImage = absoluteUrl(image ?? SITE.ogImage);

  return {
    title,
    description: safeDescription,
    alternates: {
      canonical,
      languages: languageAlternates(path, translatedLocales),
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

/** The Almanyar entity. A single human consultant (Mohammad Jahanbani),
 *  not a registered company. All other JSON-LD references this Person via
 *  { @id: …/#person }. */
export function personLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE.url}/#person`,
    name: OWNER.fullName,           // محمد جهانبانی
    alternateName: OWNER.brand,     // آلمانیار
    url: SITE.url,
    image: absoluteUrl(OWNER_PHOTO_URL),
    description: 'مشاور مهاجرت تحصیلی به آلمان از ترکیه',
    jobTitle: OWNER.jobTitle,
    affiliation: {
      '@type': 'EducationalOrganization',
      name: OWNER.university,
      url: OWNER.universityUrl,
    },
    knowsLanguage: ['fa', 'tr', 'de', 'en'],
    knowsAbout: [
      'German student visa',
      'Turkey student residence permit',
      'DAAD',
      'Studienkolleg',
      'TestDaF',
      'Goethe Zertifikat',
      'telc',
      'Blocked Account',
      'Aufenthaltstitel',
      'e-ikamet',
    ],
    // Email intentionally omitted (PHASE-2-PLAN §5.A ack: no scraper bait).
    // Contact surface is the homepage anchor; spoken support today is fa+tr
    // (broader knowsLanguage list above covers reading/writing knowledge).
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE.url}/fa#contact`,
      availableLanguage: ['fa', 'tr'],
    },
    sameAs: SITE.social,
  };
}

/**
 * Person + AggregateRating. Only emitted when there are enough reviews
 * to substantiate the rating (BUG-03 threshold: reviewsCount >= 5).
 */
export function personWithRatingLd(stats: { reviews: number | null; rating: number | null }) {
  const base = personLd();
  if (stats.reviews != null && stats.reviews >= 5 && stats.rating != null) {
    return {
      ...base,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: stats.rating.toFixed(1),
        reviewCount: stats.reviews,
        bestRating: '5',
        worstRating: '1',
      },
    };
  }
  return base;
}

export function webSiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: ['fa'],
    publisher: { '@id': `${SITE.url}/#person` },
    // Placeholder SearchAction — search route lands in Phase 6.
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/fa/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/* ─── Three Services, one per business surface (PHASE-2-PLAN §SEO-03). ── */

/** Turkish university admission — FREE for the client. */
export function turkishAdmissionServiceLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE.url}/#service-tr-admission`,
    name: 'اخذ پذیرش از دانشگاه‌های ترکیه',
    serviceType: 'Turkish University Admission Assistance',
    description: 'اخذ پذیرش از دانشگاه‌های ترکیه — رایگان',
    areaServed: { '@type': 'Country', name: 'Turkey' },
    provider: { '@id': `${SITE.url}/#person` },
    url: localizedUrl(locale, '/how-it-works'),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TRY',
      availability: 'https://schema.org/InStock',
    },
  };
}

/** Settlement services in Turkey (housing, residence permit, etc.). Paid,
 *  but the price is set offline per private contract — never disclosed
 *  in JSON-LD (PHASE-2-PLAN constraint). */
export function settlementServiceLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE.url}/#service-settlement`,
    name: 'خدمات استقرار دانشجویی در ترکیه',
    serviceType: 'Student Settlement Services in Turkey',
    description:
      'یافتن مسکن، افتتاح حساب بانکی ترکیه، اخذ شماره مالیاتی (Vergi Numarası)، ثبت‌نام دانشگاه، بیمه درمانی، اخذ اقامت تحصیلی (e-ikamet) و راهنمایی روزانه پس از ورود.',
    areaServed: { '@type': 'Country', name: 'Turkey' },
    provider: { '@id': `${SITE.url}/#person` },
    url: localizedUrl(locale, '/how-it-works'),
    termsOfService: localizedUrl(locale, '/how-it-works'),
    // No `offers.price` field — price is private + contract-bound.
  };
}

/** Germany-side guidance. Honest scope: we accompany, we don't guarantee. */
export function germanyConsultingServiceLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE.url}/#service-germany`,
    name: 'همراهی در مسیر مهاجرت تحصیلی به آلمان',
    serviceType: 'Germany Migration Consulting',
    description:
      'همراهی در مراحل ویزای آلمان، آماده‌سازی پرونده، پذیرش دانشگاه‌های آلمان و آزمون‌های زبان. تصمیم نهایی با سفارت آلمان، دانشگاه‌ها و مراکز آزمون است.',
    areaServed: { '@type': 'Country', name: 'Germany' },
    provider: { '@id': `${SITE.url}/#person` },
    url: localizedUrl(locale, '/how-it-works'),
    termsOfService: localizedUrl(locale, '/how-it-works'),
    // No `offers.price` — same offline-contract model.
  };
}

/* ─────────────── deprecated, kept for the SEO-03 transition ──────────────
 * Phase-2 commit "feat(seo): swap Organization → Person" replaces every
 * caller of the three legacy builders below. They stay exported for one
 * commit so reverting the swap doesn't break a caller that still imports
 * them. Delete them in the follow-up cleanup commit once the live site
 * has been verified on the new shape. */

/** @deprecated Use {@link personLd}. */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#person`,
    name: SITE.name,
    alternateName: SITE.brandLatin,
    url: SITE.url,
    logo: absoluteUrl(SITE.logo),
    image: absoluteUrl(SITE.ogImage),
    description: 'خدمات تخصصی مهاجرت تحصیلی به آلمان از مسیر ترکیه.',
    areaServed: ['IR', 'TR', 'DE'],
    sameAs: SITE.social,
  };
}

/** @deprecated Use {@link webSiteLd}. */
export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: ['fa'],
    publisher: { '@id': `${SITE.url}/#person` },
  };
}

/** @deprecated Use the three focused builders (turkishAdmission /
 *  settlement / germanyConsulting). Kept until SEO-03 verification. */
export function serviceLd(locale: Locale) {
  return germanyConsultingServiceLd(locale);
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
  /** ISO date (YYYY-MM-DD). Emitted as both datePublished + dateModified
   *  unless overridden. */
  dateModified?: string;
  datePublished?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    inLanguage: HREFLANG[input.locale],
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    image: absoluteUrl(input.image ?? SITE.ogImage),
    mainEntityOfPage: localizedUrl(input.locale, input.path),
    author: { '@id': `${SITE.url}/#person` },
    publisher: { '@id': `${SITE.url}/#person` },
  };
}
