import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, locales, type Locale } from '@/lib/i18n';
import PageHero from '@/components/PageHero';
import { resolveUpdatedAt } from '@/lib/dates';
import { localePath } from '@/lib/i18n';
import JsonLd from '@/components/JsonLd';
import { pageMetadata, breadcrumbLd, localizedUrl } from '@/lib/seo';
import { PAGE_SEO } from '@/lib/seo-content';
import RelatedLinks from '@/components/RelatedLinks';
import {
  inflationNote, minWageNote, monthlySummary,
  rentIstanbul, rentAnkaraIzmir, rentCheaper, rentNote,
  food, foodPricesNote, utilities, transportNote, transport,
  mobile, insurance, initialCosts, leisure, conclusions,
} from '@/lib/turkey-costs-data';

export function generateMetadata(): Metadata {
  const s = PAGE_SEO.turkeyCosts;
  return pageMetadata({ locale: 'fa', path: s.path, title: s.title, description: s.description, type: 'article' });
}

type Table = { headers: string[]; rows: string[][]; caption?: string };

export default async function TurkeyCostsPage({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const dict = await getDictionary(params.locale);

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd
        data={breadcrumbLd([
          { name: 'خانه', url: localizedUrl(params.locale) },
          { name: 'هزینه‌های ترکیه', url: localizedUrl(params.locale, '/turkey-costs') },
        ])}
      />

      <PageHero
        locale={params.locale}
        icon="🇹🇷💰"
        title="هزینه زندگی در ترکیه"
        subtitle="راهنمای کامل و به‌روز هزینه‌های زندگی دانشجویی در ترکیه به تفکیک شهر و سبک زندگی"
        updatedAt={resolveUpdatedAt({ sourceFile: 'src/app/[locale]/turkey-costs/page.tsx' })}
        accentGradient="from-red-600 to-red-800"
        breadcrumbs={[
          { label: 'خانه', href: localePath(params.locale) },
          { label: dict.nav.turkeyCosts },
        ]}
      />

      <main className="container mx-auto max-w-5xl space-y-16 px-4 py-16 sm:px-6">
        {/* Inflation note */}
        <div className="bg-amber-50 border-r-4 border-amber-400 rounded-xl p-5 text-amber-800 leading-8">
          ⚠️ {inflationNote}
        </div>

        {/* Summary */}
        <Section title="جمع‌بندی سریع ماهانه" subtitle="بازه هزینه ماهانه به تفکیک نوع زندگی و شهر (TL)">
          <DataTable table={monthlySummary} highlightFirst />
          <Note>📌 {minWageNote}</Note>
        </Section>

        {/* Rent */}
        <Section title="اجاره خانه" subtitle="بزرگ‌ترین هزینه زندگی در ترکیه (TL در ماه)">
          <h3 className="font-bold text-gray-800 mb-3 mt-2">استانبول</h3>
          <DataTable table={rentIstanbul} highlightFirst />
          <h3 className="font-bold text-gray-800 mb-3 mt-8">آنکارا / ازمیر</h3>
          <DataTable table={rentAnkaraIzmir} highlightFirst />
          <h3 className="font-bold text-gray-800 mb-3 mt-8">{rentCheaper.caption}</h3>
          <DataTable table={rentCheaper} highlightFirst />
          <Note>🏙️ {rentNote}</Note>
        </Section>

        {/* Food */}
        <Section title="خورد و خوراک ماهانه" subtitle="به تفکیک سبک مصرف (TL)">
          <DataTable table={food} highlightFirst />
          <Note>🛒 {foodPricesNote}</Note>
        </Section>

        {/* Utilities */}
        <Section title="قبوض و خدمات خانه" subtitle="هزینه ماهانه (TL)">
          <DataTable table={utilities} highlightFirst />
        </Section>

        {/* Transport */}
        <Section title="حمل‌ونقل" subtitle="هزینه ماهانه (TL)">
          <Note>🚇 {transportNote}</Note>
          <div className="mt-4"><DataTable table={transport} highlightFirst /></div>
        </Section>

        {/* Mobile */}
        <Section title="موبایل، اینترنت و دیجیتال" subtitle="هزینه ماهانه (TL)">
          <DataTable table={mobile} highlightFirst />
          <Note>📱 {mobile.note}</Note>
        </Section>

        {/* Insurance */}
        <Section title="بیمه و درمان" subtitle="هزینه‌های سلامت (TL)">
          <DataTable table={insurance} highlightFirst />
          <Note>🏥 {insurance.note}</Note>
        </Section>

        {/* Initial costs */}
        <Section title="هزینه‌های اولیه ورود به ترکیه" subtitle="هزینه‌های یک‌بار در ابتدای ورود (TL)">
          <DataTable table={initialCosts} highlightFirst />
          <Note>💼 {initialCosts.note}</Note>
        </Section>

        {/* Leisure */}
        <Section title="رستوران و تفریح" subtitle="هزینه‌های جانبی (TL)">
          <DataTable table={leisure} highlightFirst />
        </Section>

        {/* Conclusion */}
        <Section title="نتیجه کاربردی" subtitle="عددهای کلیدی برای برنامه‌ریزی بودجه">
          <div className="grid sm:grid-cols-2 gap-5">
            {conclusions.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-6 border-r-4 border-red-500">
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-red-700 my-1">{c.value}</p>
                <p className="text-sm text-gray-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Cross-links + CTA */}
        <section className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">برنامه‌ریزی مالی برای زندگی در ترکیه</h2>
          <p className="opacity-90 mb-6">برای مشاوره دقیق متناسب با شرایط شما با ما در تماس باشید.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/${params.locale}/turkey-residence`} className="inline-block bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-8 rounded-xl transition">
              🛂 راهنمای اقامت تحصیلی ترکیه
            </Link>
            <Link href={`/${params.locale}#contact`} className="inline-block bg-white text-red-700 font-bold py-3 px-8 rounded-xl transition transform hover:scale-105">
              رزرو مشاوره رایگان
            </Link>
          </div>
        </section>

        <RelatedLinks
          items={[
            { title: 'اقامت تحصیلی ترکیه', description: 'مراحل ثبت‌نام، مدارک e-ikamet و راهنمای استقرار در شهرهای اصلی.', href: '/fa/turkey-residence', icon: '🛂', accent: 'rose' },
            { title: 'ویزای آلمان از ترکیه', description: 'وقت سفارت، iDATA و نکات مالی برای ایرانیان مقیم ترکیه.', href: '/fa/germany-visa-from-turkey', icon: '🇩🇪', accent: 'green' },
            { title: 'تحصیل در آلمان', description: 'انتخاب دانشگاه، رشته، آزمون‌های زبان و فرایند uni-assist.', href: '/fa/study-germany', icon: '🎓', accent: 'blue' },
            { title: 'حساب مسدودی (Sperrkonto)', description: 'چقدر پول لازم است، چطور افتتاح کنید و کجا.', href: '/fa/germany-visa/documents', icon: '💰', accent: 'amber' },
            { title: 'اخبار و راهنماها', description: 'تازه‌ترین تغییرات و توصیه‌ها در همه‌ی این موضوعات.', href: '/fa/news', icon: '📰', accent: 'slate' },
            { title: 'فرم ارزیابی رایگان', description: 'ببینید بودجه‌ی شما برای مسیر ترکیه چقدر کافی است.', href: '/fa/evaluation', icon: '📝', accent: 'purple' },
          ]}
        />
      </main>

    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">{title}</h2>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
        <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-3 rounded-full"></div>
      </div>
      {children}
    </section>
  );
}

function DataTable({ table, highlightFirst }: { table: Table; highlightFirst?: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-x-auto">
      <table className="w-full text-sm min-w-[500px]">
        <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <tr>
            {table.headers.map((h, i) => (
              <th key={i} className={`px-5 py-3 ${i === 0 ? 'text-right' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {table.rows.map((row, i) => (
            <tr key={i} className="hover:bg-red-50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`px-5 py-3 ${j === 0 && highlightFirst ? 'font-medium text-gray-800 text-right' : 'text-gray-600 text-left'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <div className="bg-blue-50 border-r-4 border-blue-400 rounded-lg p-4 mt-4 text-sm text-blue-800 leading-7">{children}</div>;
}
