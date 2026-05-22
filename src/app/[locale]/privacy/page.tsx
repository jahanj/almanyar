import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n';
import LegalPage from '@/components/legal/LegalPage';
import JsonLd from '@/components/JsonLd';
import { pageMetadata, breadcrumbLd, localizedUrl } from '@/lib/seo';
import { resolveUpdatedAt } from '@/lib/dates';
import { PRIVACY } from '@/lib/legal-content';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return pageMetadata({
    locale: params.locale,
    path: '/privacy',
    title: 'حریم خصوصی | آلمانیار',
    description:
      'چه داده‌هایی از شما جمع می‌کنیم، چرا، با چه کسی به اشتراک می‌گذاریم، و حقوق شما در قبال آن.',
    noindex: false,
  });
}

export default function PrivacyPage({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const updatedAt = resolveUpdatedAt({ sourceFile: 'src/lib/legal-content.ts' });
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'خانه', url: localizedUrl(params.locale) },
          { name: 'حریم خصوصی', url: localizedUrl(params.locale, '/privacy') },
        ])}
      />
      <LegalPage
        locale={params.locale}
        title={PRIVACY.pageTitle}
        intro={PRIVACY.intro}
        blocks={PRIVACY.blocks}
        updatedAt={updatedAt}
        breadcrumbLabel="حریم خصوصی"
      />
    </>
  );
}
