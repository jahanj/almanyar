import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, locales, localePath, type Locale } from '@/lib/i18n';
import PageHero, { pageCtaPrimary, pageCtaSecondary } from '@/components/PageHero';
import JsonLd from '@/components/JsonLd';
import { pageMetadata, breadcrumbLd, localizedUrl } from '@/lib/seo';
import { resolveUpdatedAt } from '@/lib/dates';
import { HOW_IT_WORKS } from '@/lib/positioning-content';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return pageMetadata({
    locale: params.locale,
    path: '/how-it-works',
    title: 'نحوه کار آلمانیار — چرا ریسک شما صفر است | آلمانیار',
    description:
      'پذیرش دانشگاه‌های ترکیه رایگان، شهریه مستقیماً به دانشگاه، خدمات استقرار با قرارداد شفاف، و همراهی صادقانه در مسیر آلمان.',
  });
}

export default async function HowItWorksPage({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  // Hydrate dict only to validate locale; nav comes from layout, not this file.
  await getDictionary(params.locale);
  const updatedAt = resolveUpdatedAt({ sourceFile: 'src/lib/positioning-content.ts' });

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd
        data={breadcrumbLd([
          { name: 'خانه', url: localizedUrl(params.locale) },
          { name: 'نحوه کار ما', url: localizedUrl(params.locale, '/how-it-works') },
        ])}
      />

      <PageHero
        locale={params.locale}
        icon="🤝"
        eyebrow="نحوه کار آلمانیار"
        title={HOW_IT_WORKS.pageTitle}
        subtitle={HOW_IT_WORKS.intro}
        updatedAt={updatedAt}
        accentGradient="from-emerald-700 to-emerald-900"
        breadcrumbs={[
          { label: 'خانه', href: localePath(params.locale) },
          { label: 'نحوه کار ما' },
        ]}
      >
        {pageCtaPrimary(localePath(params.locale, '#contact'), 'دریافت مشاوره رایگان')}
        {pageCtaSecondary(localePath(params.locale, '/evaluation'), 'فرم ارزیابی رایگان')}
      </PageHero>

      <main className="container mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
        {/* Four steps */}
        <ol className="space-y-6">
          {HOW_IT_WORKS.steps.map((s, i) => (
            <li
              key={i}
              className="rounded-2xl border border-emerald-200/70 bg-white p-6 shadow-soft md:p-8"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h2 className="text-xl font-bold text-emerald-900 md:text-2xl">{s.title}</h2>
              </div>
              <p className="leading-8 text-slate-700">{s.body}</p>
              {('bullets' in s && s.bullets) ? (
                <ul className="mt-4 space-y-2 ps-4">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-slate-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
                      <span className="leading-7">{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {('callout' in s && s.callout) ? (
                <aside
                  data-testid="step-callout"
                  className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-7 text-amber-900"
                >
                  <p className="font-semibold">{s.callout.heading}</p>
                  <p className="mt-1.5">{s.callout.body}</p>
                </aside>
              ) : null}
            </li>
          ))}
        </ol>

        {/* Why */}
        <section
          aria-labelledby="why-title"
          className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-soft md:p-10"
        >
          <h2 id="why-title" className="mb-4 text-2xl font-bold text-emerald-900 md:text-3xl">
            {HOW_IT_WORKS.whyHeader}
          </h2>
          <ul className="space-y-3">
            {HOW_IT_WORKS.whyBullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-slate-700">
                <span className="mt-1 text-emerald-700">✓</span>
                <span className="leading-7">{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section
          aria-label="مشاوره رایگان"
          className="rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-8 text-white shadow-glow md:p-10"
        >
          <h2 className="text-2xl font-bold md:text-3xl">{HOW_IT_WORKS.ctaTitle}</h2>
          <p className="mt-3 max-w-2xl leading-8 text-white/90">{HOW_IT_WORKS.ctaDesc}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {pageCtaPrimary(localePath(params.locale, '#contact'), 'دریافت مشاوره رایگان')}
          </div>
        </section>
      </main>
    </div>
  );
}
