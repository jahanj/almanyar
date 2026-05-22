import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, locales, type Locale } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { localePath } from '@/lib/i18n';
import FaqAccordion from '@/components/FaqAccordion';
import JsonLd from '@/components/JsonLd';
import ExamRegisterForm from '@/components/ExamRegisterForm';
import { pageMetadata, faqLd, breadcrumbLd, localizedUrl, absoluteUrl, SITE } from '@/lib/seo';
import { PAGE_SEO } from '@/lib/seo-content';
import { examGroups, examSteps, examFaq } from '@/lib/exams-data';

export function generateMetadata(): Metadata {
  const s = PAGE_SEO.exams;
  return pageMetadata({ locale: 'fa', path: s.path, title: s.title, description: s.description });
}

const accentMap: Record<string, { border: string; chip: string; ring: string }> = {
  blue: { border: 'border-blue-500', chip: 'bg-blue-50 text-blue-700', ring: 'bg-blue-100' },
  green: { border: 'border-green-500', chip: 'bg-green-50 text-green-700', ring: 'bg-green-100' },
  purple: { border: 'border-purple-500', chip: 'bg-purple-50 text-purple-700', ring: 'bg-purple-100' },
  red: { border: 'border-red-500', chip: 'bg-red-50 text-red-700', ring: 'bg-red-100' },
  yellow: { border: 'border-yellow-500', chip: 'bg-yellow-50 text-yellow-700', ring: 'bg-yellow-100' },
  indigo: { border: 'border-indigo-500', chip: 'bg-indigo-50 text-indigo-700', ring: 'bg-indigo-100' },
};

export default async function ExamsPage({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const dict = await getDictionary(params.locale);

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'خدمات ثبت‌نام آزمون‌های زبان آلمانی',
    serviceType: 'ثبت‌نام آزمون گوته، telc، TestDaF، TestAS، DSH و ÖSD',
    description: PAGE_SEO.exams.description,
    areaServed: ['TR', 'DE', 'IR'],
    provider: { '@id': `${SITE.url}/#organization` },
    url: localizedUrl(params.locale, '/exams'),
    image: absoluteUrl(SITE.ogImage),
    offers: examGroups.map((g) => ({
      '@type': 'Offer',
      name: `ثبت‌نام ${g.provider}`,
      category: 'آزمون زبان آلمانی',
      priceCurrency: 'TRY',
      description: g.price,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          serviceLd,
          faqLd(examFaq),
          breadcrumbLd([
            { name: 'خانه', url: localizedUrl(params.locale) },
            { name: 'ثبت‌نام آزمون‌های زبان آلمانی', url: localizedUrl(params.locale, '/exams') },
          ]),
        ]}
      />
      <Header dict={dict} locale={params.locale} />

      <PageHero
        locale={params.locale}
        eyebrow="خدمت ویژه آلمانیار"
        title="ثبت‌نام آزمون‌های زبان آلمانی — گوته، telc، TestDaF و بیشتر"
        subtitle="رزرو صندلی و ثبت‌نام آزمون در مراکز معتبر ترکیه و آزمون‌های مرتبط با آلمان را به ما بسپارید. از انتخاب آزمون تا پرداخت هزینه، همه‌چیز بدون استرس و در کنار شما."
        breadcrumbs={[
          { label: 'خانه', href: localePath(params.locale) },
          { label: 'ثبت‌نام آزمون‌ها' },
        ]}
      >
        <a
          href="#register"
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-700"
        >
          🎯 درخواست ثبت‌نام آزمون
        </a>
        <a
          href="#exams"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-soft transition hover:bg-slate-50"
        >
          مشاهده آزمون‌ها و هزینه‌ها
        </a>
      </PageHero>

      <main className="container mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6">
        {/* How we help */}
        <section>
          <SectionHeading title="آلمانیار چه کاری برای شما انجام می‌دهد؟" subtitle="ثبت‌نام آزمون بدون دردسر، از ابتدا تا انتها" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {examSteps.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-6 card-hover">
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-7">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Exam cards */}
        <section id="exams" className="scroll-mt-24">
          <SectionHeading title="آزمون‌های قابل ثبت‌نام" subtitle="معتبرترین آزمون‌های زبان و تحصیلی آلمان" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examGroups.map((g) => {
              const c = accentMap[g.accent]!;
              return (
                <div key={g.id} className={`relative bg-white rounded-2xl shadow-xl p-6 border-t-4 ${c.border} card-hover overflow-hidden`}>
                  <div className={`absolute top-0 left-0 w-20 h-20 ${c.ring} rounded-full -ml-10 -mt-10 opacity-60`}></div>
                  <div className="relative">
                    <div className="text-4xl mb-3">{g.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800">{g.provider}</h3>
                    <p className="text-sm text-blue-600 font-medium mb-3">{g.tagline}</p>
                    <p className="text-gray-600 text-sm leading-7 mb-4">{g.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {g.levels.map((l) => (
                        <span key={l} className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.chip}`}>{l}</span>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-500 mb-1">هزینه تقریبی</p>
                      <p className="text-sm font-bold text-gray-800 leading-6">{g.price}</p>
                    </div>
                    <a href="#register" className="mt-4 inline-block w-full text-center bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold py-2.5 rounded-lg transition">
                      ثبت‌نام این آزمون
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            💡 قیمت‌ها تقریبی‌اند و بسته به مرکز و تاریخ تغییر می‌کنند. آلمانیار در ثبت‌نام و پرداخت هزینه به ارز محلی (لیر) به شما کمک می‌کند.
          </p>
        </section>

        {/* Registration form */}
        <section id="register" className="scroll-mt-24">
          <SectionHeading title="درخواست ثبت‌نام آزمون" subtitle="فرم را پر کنید؛ کارشناسان ما تماس می‌گیرند و کار را شروع می‌کنیم" />
          <div className="max-w-3xl mx-auto">
            <ExamRegisterForm />
          </div>
        </section>

        {/* FAQ */}
        <section>
          <SectionHeading title="سوالات متداول ثبت‌نام آزمون" subtitle="پاسخ پرسش‌های رایج درباره آزمون‌های زبان آلمانی" />
          <div className="max-w-3xl mx-auto">
            <FaqAccordion items={examFaq} />
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 md:p-10 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">آماده‌اید برای آزمون زبان آلمانی ثبت‌نام کنید؟</h2>
          <p className="opacity-90 mb-6">صندلی آزمون‌های پرتقاضا سریع پر می‌شود — همین حالا اقدام کنید.</p>
          <a href="#register" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-xl transition transform hover:scale-105">
            شروع ثبت‌نام
          </a>
        </section>
      </main>

      <Footer dict={dict} locale={params.locale} />
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">{title}</h2>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
      <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-3 rounded-full"></div>
    </div>
  );
}
