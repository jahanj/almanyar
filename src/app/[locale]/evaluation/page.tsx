import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, locales, type Locale } from '@/lib/i18n';
import PageHero from '@/components/PageHero';
import { localePath } from '@/lib/i18n';
import EvaluationWizard from '@/components/EvaluationWizard';
import JsonLd from '@/components/JsonLd';
import { pageMetadata, breadcrumbLd, localizedUrl } from '@/lib/seo';
import { PAGE_SEO } from '@/lib/seo-content';

export function generateMetadata(): Metadata {
  const s = PAGE_SEO.evaluation;
  return pageMetadata({ locale: 'fa', path: s.path, title: s.title, description: s.description });
}

export default async function EvaluationPage({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const dict = await getDictionary(params.locale);

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd
        data={breadcrumbLd([
          { name: 'خانه', url: localizedUrl(params.locale) },
          { name: 'فرم ارزیابی رایگان', url: localizedUrl(params.locale, '/evaluation') },
        ])}
      />

      <PageHero
        locale={params.locale}
        title="فرم ارزیابی اولیه تحصیل در آلمان"
        subtitle="انتخاب بهترین مسیر تحصیلی با توجه به شرایط شما. اطلاعات شما محرمانه است و فقط برای بررسی امکان مهاجرت استفاده می‌شود."
        eyebrow={dict.nav.evaluation}
        breadcrumbs={[
          { label: 'خانه', href: localePath(params.locale) },
          { label: dict.nav.evaluation },
        ]}
      />

      <main className="container mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <EvaluationWizard />
      </main>

    </div>
  );
}
