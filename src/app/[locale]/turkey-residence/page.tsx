import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, locales, type Locale } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero, { pageCtaPrimary } from '@/components/PageHero';
import { localePath } from '@/lib/i18n';
import FaqAccordion from '@/components/FaqAccordion';
import JsonLd from '@/components/JsonLd';
import { pageMetadata, faqLd, breadcrumbLd, localizedUrl } from '@/lib/seo';
import { PAGE_SEO } from '@/lib/seo-content';
import {
  trQuickFacts, trPhases, trDocuments, trInsurance,
  trSpecialCases, trDigitalSystems, trFaq,
} from '@/lib/turkey-data';

export function generateMetadata(): Metadata {
  const s = PAGE_SEO.turkeyResidence;
  return pageMetadata({ locale: 'fa', path: s.path, title: s.title, description: s.description, type: 'article' });
}

export default async function TurkeyResidencePage({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const dict = await getDictionary(params.locale);

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          faqLd(trFaq),
          breadcrumbLd([
            { name: 'خانه', url: localizedUrl(params.locale) },
            { name: 'اقامت تحصیلی ترکیه', url: localizedUrl(params.locale, '/turkey-residence') },
          ]),
        ]}
      />
      <Header dict={dict} locale={params.locale} />

      <PageHero
        locale={params.locale}
        icon="🇹🇷"
        title="راهنمای جامع اقامت تحصیلی ترکیه"
        subtitle="راهنمای کامل و کاربردی فرآیند اخذ اقامت دانشجویی (Öğrenci İkamet İzni) از پذیرش دانشگاه تا صدور و تمدید کارت اقامت — با اصطلاحات رسمی ترکی."
        accentGradient="from-red-600 to-red-800"
        breadcrumbs={[
          { label: 'خانه', href: localePath(params.locale) },
          { label: dict.nav.turkey },
        ]}
      >
        {pageCtaPrimary(localePath(params.locale, '#contact'), '🚀 رزرو مشاوره رایگان')}
      </PageHero>

      <main className="container mx-auto max-w-5xl space-y-20 px-4 py-16 sm:px-6">
        {/* Quick facts */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trQuickFacts.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-6 flex items-start gap-4 card-hover">
                <span className="text-3xl">{f.icon}</span>
                <div>
                  <p className="text-sm text-gray-500">{f.label}</p>
                  <p className="font-bold text-gray-800">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Phases timeline */}
        <Section title="مراحل کامل اخذ اقامت" subtitle="از قبل از ورود تا صدور کارت اقامت">
          <div className="space-y-6">
            {trPhases.map((p) => (
              <div key={p.n} className="bg-white rounded-2xl shadow p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {p.n}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>{p.icon}</span>{p.title}
                  </h3>
                </div>
                <ul className="space-y-2 mb-4">
                  {p.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-amber-50 border-r-4 border-amber-400 rounded-lg p-4 text-sm text-amber-800">
                  💡 {p.note}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Documents */}
        <Section title="مدارک مورد نیاز" subtitle="فهرست کامل با محل دریافت و نکات">
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <tr>
                  <th className="px-5 py-3 text-right">مدرک</th>
                  <th className="px-5 py-3 text-right">محل دریافت</th>
                  <th className="px-5 py-3 text-right">نکات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {trDocuments.map((d, i) => (
                  <tr key={i} className="hover:bg-red-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{d.name}</td>
                    <td className="px-5 py-3 text-gray-600">{d.where}</td>
                    <td className="px-5 py-3 text-gray-600">{d.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Insurance */}
        <Section title="سیستم بیمه سلامت" subtitle="SGK دولتی یا بیمه خصوصی">
          <div className="grid md:grid-cols-3 gap-6">
            {trInsurance.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-6 card-hover">
                <div className="text-4xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{c.title}</h3>
                <p className="text-gray-600 text-sm leading-7">{c.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Address registration */}
        <Section title="ثبت آدرس (İkametgah)" subtitle="ثبت محل سکونت در اداره ثبت احوال">
          <div className="bg-white rounded-2xl shadow p-6 md:p-8 space-y-3 text-gray-700 leading-8">
            <p>پس از اجاره خانه یا اسکان در خوابگاه، باید آدرس محل سکونت خود را در اداره ثبت احوال (<b>Nüfus Müdürlüğü</b>) ثبت کنید و گواهی آدرس (<b>Yerleşim Yeri Belgesi</b>) بگیرید.</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span>قرارداد اجاره ثبت‌شده در نوتر یا گواهی خوابگاه لازم است</li>
              <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span>گواهی آدرس از طریق e-Devlet هم قابل دریافت است</li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-1">⚠</span>آدرس جعلی یا آپارتمان پرجمعیت ریسک رد درخواست و جریمه دارد</li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-1">⚠</span>هنگام جابجایی، آدرس را حتماً به‌روزرسانی کنید</li>
            </ul>
          </div>
        </Section>

        {/* Renewal */}
        <Section title="تمدید اقامت (Uzatma)" subtitle="مهلت‌ها و نکات کلیدی">
          <div className="bg-white rounded-2xl shadow p-6 md:p-8">
            <div className="bg-red-50 border-r-4 border-red-500 rounded-lg p-5 mb-5">
              <p className="text-gray-800">⏰ <b>درخواست تمدید را حداقل ۶۰ روز قبل از انقضای اقامت</b> در سامانه e-ikamet ثبت کنید. هرگز اجازه ندهید اقامت منقضی شود.</p>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span>بیمه را همزمان با اقامت تمدید کنید</li>
              <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span>تغییر دانشگاه/رشته را به اداره مهاجرت اطلاع دهید</li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-1">⚠</span>انصراف، اخراج تحصیلی یا غیرفعال بودن می‌تواند منجر به لغو خودکار اقامت شود</li>
            </ul>
          </div>
        </Section>

        {/* Special cases */}
        <Section title="موارد خاص و بحرانی" subtitle="ریجکت، overstay، گم شدن کارت و تغییر وضعیت">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trSpecialCases.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-6">
                <div className="text-4xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{c.title}</h3>
                <p className="text-gray-600 text-sm leading-7">{c.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Digital systems */}
        <Section title="سامانه‌های دیجیتال" subtitle="سیستم‌های دولتی که باید بشناسید">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trDigitalSystems.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-5">
                <h3 className="font-bold text-red-700 mb-1">{s.name}</h3>
                <p className="text-gray-600 text-sm leading-7">{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section title="سوالات متداول" subtitle="پاسخ پرسش‌های رایج درباره اقامت تحصیلی ترکیه">
          <FaqAccordion items={trFaq} />
        </Section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">برای اخذ اقامت تحصیلی ترکیه به کمک نیاز دارید؟</h2>
          <p className="opacity-90 mb-6">کارشناسان ما در تمام مراحل از پذیرش تا صدور کارت همراه شما هستند.</p>
          <Link
            href={`/${params.locale}#contact`}
            className="inline-block bg-white text-red-700 font-bold py-3 px-8 rounded-xl transition transform hover:scale-105"
          >
            رزرو مشاوره رایگان
          </Link>
        </section>
      </main>

      <Footer dict={dict} locale={params.locale} />
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">{title}</h2>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
        <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-3 rounded-full"></div>
      </div>
      {children}
    </section>
  );
}
