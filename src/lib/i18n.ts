export type Locale = 'fa';

// Persian-only site. (tr/de were retired; their locale files remain unused.)
export const locales: Locale[] = ['fa'];
export const defaultLocale: Locale = 'fa';

export const isRtl = (_l: Locale) => true;

export const dictionaries = {
  fa: () => import('@/locales/fa').then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<typeof dictionaries.fa>>;

export async function getDictionary(_locale: Locale = defaultLocale): Promise<Dictionary> {
  return dictionaries.fa();
}

/** Locale-prefixed in-app path (e.g. `/fa/guide`, `/fa#contact`). Never uses localhost. */
export function localePath(locale: Locale, path = ''): string {
  const normalized = path.startsWith('/') ? path : path ? `/${path}` : '';
  if (normalized.startsWith('#')) return `/${locale}${normalized}`;
  return `/${locale}${normalized}`;
}
