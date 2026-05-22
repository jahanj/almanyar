import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, locales, type Locale } from '@/lib/i18n';
import FaqAccordion from '@/components/FaqAccordion';
import PageHero, { pageCtaPrimary } from '@/components/PageHero';
import { localePath } from '@/lib/i18n';
import JsonLd from '@/components/JsonLd';
import { pageMetadata, articleLd, faqLd, breadcrumbLd, localizedUrl } from '@/lib/seo';
import { resolveUpdatedAt } from '@/lib/dates';
import { PAGE_SEO } from '@/lib/seo-content';
import {
  quickFacts, universityTypes, degrees, languageScores,
  admissionDocs, visaDocs, steps, tuition, livingCosts,
  cityCosts, fields, faqItems,
} from '@/lib/guide-data';

export function generateMetadata(): Metadata {
  const s = PAGE_SEO.guide;
  return pageMetadata({ locale: 'fa', path: s.path, title: s.title, description: s.description, type: 'article' });
}

export default async function GuidePage({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const dict = await getDictionary(params.locale);

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          articleLd({ locale: params.locale, path: '/guide', headline: PAGE_SEO.guide.title, description: PAGE_SEO.guide.description }),
          faqLd(faqItems),
          breadcrumbLd([
            { name: 'خانه', url: localizedUrl(params.locale) },
            { name: 'راهنمای جامع تحصیل در آلمان', url: localizedUrl(params.locale, '/guide') },
          ]),
        ]}
      />
      <PageHero
        locale={params.locale}
        title="راهنمای جامع تحصیل در آلمان"
        subtitle="تحصیل در دانشگاه‌های دولتی آلمان رایگان است. در این راهنما همه‌چیز درباره سیستم آموزشی، مدارک، مراحل اقدام و هزینه‌ها را توضیح داده‌ایم."
        eyebrow={dict.nav.guide}
        updatedAt={resolveUpdatedAt({ sourceFile: 'src/app/[locale]/guide/page.tsx' })}
        breadcrumbs={[
          { label: 'خانه', href: localePath(params.locale) },
          { label: dict.nav.guide },
        ]}
      >
        {pageCtaPrimary(localePath(params.locale, '#contact'), '🚀 رزرو مشاوره رایگان')}
      </PageHero>

      <main className="container mx-auto max-w-5xl space-y-20 px-4 py-16 sm:px-6">
        {/* Quick facts */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quickFacts.map((f, i) => (
              <div key={i} className="card-hover flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
                <span className="text-3xl">{f.icon}</span>
                <div>
                  <p className="text-sm text-gray-500">{f.label}</p>
                  <p className="font-bold text-gray-800">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education system */}
        <Section title="مقاطع و مراکز آموزش عالی" subtitle="دانشگاه، دانشگاه علمی کاربردی و مراکز هنر">
          <div className="bg-blue-50 border-r-4 border-blue-500 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-gray-800 mb-2">🎓 کالج (Studienkolleg) — پلی برای ورود به دانشگاه</h3>
            <p className="text-gray-600 leading-8">
              چون دیپلم ایران ۱۲ ساله است و آلمان تحصیلات ۱۳ ساله می‌خواهد، برای جبران این گپ و یادگیری
              زبان، شرکت در کالج متداول‌ترین روش است. رشته کالج باید همان رشته دیپلم شما باشد. در پایان،
              آزمون <b>FSP (Feststellungsprüfung)</b> می‌دهید که صلاحیت شما را برای دانشگاه می‌سنجد.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {universityTypes.map((u, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-6 card-hover">
                <div className="text-4xl mb-3">{u.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{u.title}</h3>
                <p className="text-gray-600 text-sm leading-7">{u.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Degrees */}
        <Section title="تحصیل در مقاطع دانشگاهی" subtitle="کارشناسی، کارشناسی ارشد و دکتری">
          <div className="grid md:grid-cols-3 gap-6">
            {degrees.map((d, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-6">
                <div className="text-4xl mb-3">{d.icon}</div>
                <h3 className="font-bold text-gray-800 text-lg">{d.title}</h3>
                <p className="text-sm text-blue-600 mb-3">⏱️ {d.duration}</p>
                <ul className="space-y-2">
                  {d.points.map((p, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5">✓</span><span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Language */}
        <Section title="نمره زبان لازم" subtitle="آلمانی یا انگلیسی، بسته به دوره">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">🇩🇪 تحصیل به زبان آلمانی</h3>
              <ul className="space-y-2">
                {languageScores.german.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600"><span className="text-green-500">✓</span>{s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">🇬🇧 تحصیل به زبان انگلیسی</h3>
              <ul className="space-y-2">
                {languageScores.english.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600"><span className="text-green-500">✓</span>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Documents */}
        <Section title="مدارک لازم" subtitle="برای پذیرش تحصیلی و درخواست ویزا">
          <div className="grid md:grid-cols-2 gap-6">
            <DocList title="📄 مدارک پذیرش تحصیلی" items={admissionDocs} color="blue" />
            <DocList title="🛂 مدارک ویزای تحصیلی (ویزای D)" items={visaDocs} color="purple" />
          </div>
        </Section>

        {/* Steps */}
        <Section title="مراحل اقدام؛ قدم به قدم" subtitle="از انتخاب دانشگاه تا شروع زندگی دانشجویی">
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-2xl shadow p-5">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{s.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 leading-7">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Costs */}
        <Section title="هزینه‌ها" subtitle="شهریه، تمکن مالی و هزینه زندگی">
          <div className="bg-yellow-50 border-r-4 border-yellow-500 rounded-xl p-6 mb-8">
            <p className="text-gray-700">
              💰 <b>تمکن مالی:</b> حداقل <b>۱۱٬۹۰۴ یورو</b> در حساب بانکی مسدود شده (Blocked Account).
              معمولاً ماهانه ۹۹۲ یورو قابل برداشت است. هزینه پردازش ویزا: ۷۵ یورو (بالای ۱۸ سال).
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <h3 className="font-bold p-4 bg-gray-800 text-white">شهریه دانشگاه</h3>
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {tuition.map((t, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-gray-700">{t.type}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 text-left">{t.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <h3 className="font-bold p-4 bg-gray-800 text-white">هزینه زندگی ماهانه</h3>
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {livingCosts.map((c, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-gray-700">{c.item}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 text-left">{c.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* City costs */}
        <Section title="مقایسه هزینه‌ها بین شهرها" subtitle="مونیخ، برلین، هامبورگ و فرانکفورت (یورو)">
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <tr>
                  {cityCosts.headers.map((h, i) => (
                    <th key={i} className={`px-4 py-3 ${i === 0 ? 'text-right' : 'text-center'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {cityCosts.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50 transition-colors">
                    {row.map((cell, j) => (
                      <td key={j} className={`px-4 py-3 ${j === 0 ? 'text-right font-medium text-gray-800' : 'text-center text-gray-600'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Free study + scholarship + work */}
        <Section title="تحصیل رایگان، بورسیه و کار" subtitle="فرصت‌های کاهش هزینه و درآمد">
          <div className="grid md:grid-cols-3 gap-6">
            <InfoCard icon="🆓" title="تحصیل رایگان" text="بیش از ۱۰ هزار دوره بدون شهریه. حدود ۲۹۰ دانشگاه دوره‌های انگلیسی رایگان هم دارند. فقط هزینه ثبت‌نام هر ترم را می‌پردازید." />
            <InfoCard icon="🏆" title="بورسیه DAAD" text="مهم‌ترین سازمان بورسیه‌دهنده، عمدتاً برای ارشد، دکتری و پست‌دکتری. می‌توانید مستقیم از اساتید هم درخواست بورسیه کنید." />
            <InfoCard icon="💼" title="کار حین تحصیل" text="۱۴۰ روز کار تمام‌وقت یا ۲۸۰ روز پاره‌وقت در سال. در دوره زبان/کالج کار مجاز نیست. کار فریلنسری نیاز به تاییدیه دارد." />
          </div>
        </Section>

        {/* Fields */}
        <Section title="رشته‌های تحصیلی محبوب" subtitle="پزشکی، دندانپزشکی و پرستاری">
          <div className="grid md:grid-cols-3 gap-6">
            {fields.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-6">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-3">{f.title}</h3>
                <ul className="space-y-2">
                  {f.points.map((p, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5">✓</span><span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Post-graduation & family */}
        <Section title="پس از فارغ‌التحصیلی" subtitle="اقامت کار، اقامت دائم و ویزای همراه">
          <div className="grid md:grid-cols-2 gap-6">
            <InfoCard icon="🔓" title="اقامت پس از تحصیل" text="۱۸ ماه فرصت کار. با شغل و حقوق ناخالص حداقل ۴۵٬۳۰۰ یورو در سال، بلوکارت ۴ ساله. پس از ۳ سال کار اقامت دائم و با ۵ سال زندگی، شهروندی." />
            <InfoCard icon="👨‍👩‍👧‍👦" title="ویزای همراه" text="امکان آوردن همسر و فرزند زیر ۱۶ سال با داشتن مجوز اقامت، تمکن مالی، فضای کافی و دانش زبان آلمانی همسر در سطح A1." />
          </div>
        </Section>

        {/* FAQ */}
        <Section title="سوالات متداول" subtitle="پاسخ پرسش‌های رایج درباره تحصیل در آلمان">
          <FaqAccordion items={faqItems} />
        </Section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">آماده‌اید مسیر مهاجرت تحصیلی را شروع کنید؟</h2>
          <p className="opacity-90 mb-6">من رایگان شرایط شما را بررسی می‌کنم.</p>
          <Link
            href={localePath(params.locale, '#contact')}
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-700"
          >
            رزرو مشاوره رایگان
          </Link>
        </section>
      </main>

    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">{title}</h2>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-3 rounded-full"></div>
      </div>
      {children}
    </section>
  );
}

function DocList({ title, items, color }: { title: string; items: string[]; color: 'blue' | 'purple' }) {
  const dot = color === 'blue' ? 'text-blue-500' : 'text-purple-500';
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="font-bold text-gray-800 mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className={`${dot} mt-0.5`}>✓</span><span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 card-hover">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-7">{text}</p>
    </div>
  );
}
