import type { Metadata } from 'next';
import { locales, isRtl, type Locale, getDictionary } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  if (!locales.includes(params.locale)) notFound();
  const dict = await getDictionary(params.locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  if (!locales.includes(params.locale)) notFound();
  const rtl = isRtl(params.locale);

  return (
    <div lang={params.locale} dir={rtl ? 'rtl' : 'ltr'} className={rtl ? 'persian-font' : 'latin-font'}>
      {children}
    </div>
  );
}
