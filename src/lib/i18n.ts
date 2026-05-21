export type Locale = 'fa' | 'tr' | 'de';

export const locales: Locale[] = ['fa', 'tr', 'de'];
export const defaultLocale: Locale = 'fa';

export const isRtl = (l: Locale) => l === 'fa';

export const dictionaries = {
  fa: () => import('@/locales/fa').then((m) => m.default),
  tr: () => import('@/locales/tr').then((m) => m.default),
  de: () => import('@/locales/de').then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<typeof dictionaries.fa>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const load = dictionaries[locale] ?? dictionaries[defaultLocale];
  return load();
}
