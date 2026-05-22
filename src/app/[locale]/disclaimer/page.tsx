import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n';
import LegalPage from '@/components/legal/LegalPage';
import JsonLd from '@/components/JsonLd';
import { pageMetadata, breadcrumbLd, localizedUrl } from '@/lib/seo';
import { resolveUpdatedAt } from '@/lib/dates';
import { DISCLAIMER } from '@/lib/legal-content';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return pageMetadata({
    locale: params.locale,
    path: '/disclaimer',
    title: 'سلب مسئولیت | آلمانیار',
    description:
      'محدوده خدمات آلمانیار، آنچه تضمین نمی‌کنیم، و چارچوب صادقانه‌ای که در آن کنار شما هستیم.',
    noindex: false,
  });
}

export default function DisclaimerPage({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const updatedAt = resolveUpdatedAt({ sourceFile: 'src/lib/legal-content.ts' });
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'خانه', url: localizedUrl(params.locale) },
          { name: 'سلب مسئولیت', url: localizedUrl(params.locale, '/disclaimer') },
        ])}
      />
      <LegalPage
        locale={params.locale}
        title={DISCLAIMER.pageTitle}
        intro={DISCLAIMER.intro}
        blocks={DISCLAIMER.blocks}
        updatedAt={updatedAt}
        breadcrumbLabel="سلب مسئولیت"
      />
    </>
  );
}
