import type { Metadata } from 'next';
import { locales, isRtl, type Locale, getDictionary } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieNotice from '@/components/legal/CookieNotice';

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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  if (!locales.includes(params.locale)) notFound();
  const rtl = isRtl(params.locale);
  const dict = await getDictionary(params.locale);

  // Header and Footer live here (single source of truth) so they're guaranteed
  // byte-identical across every locale page. See BUG-05 in PHASE-1-PLAN.md.
  return (
    <div lang={params.locale} dir={rtl ? 'rtl' : 'ltr'} className={rtl ? 'persian-font' : 'latin-font'}>
      <Header dict={dict} locale={params.locale} />
      {children}
      <Footer dict={dict} locale={params.locale} />
      <CookieNotice locale={params.locale} />
    </div>
  );
}
