import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';
import SectionHeader from './SectionHeader';

const highlights = [
  { icon: '🆓', title: 'تحصیل رایگان', text: 'در دانشگاه‌های دولتی، فقط هزینه ثبت‌نام ۱۵۰-۳۵۰ یورو در ترم' },
  { icon: '🌍', title: 'مدرک بین‌المللی', text: 'مدارک شناخته‌شده در سطح جهانی و کیفیت بالای آموزش' },
  { icon: '💼', title: 'کار حین تحصیل', text: '۱۴۰ روز تمام‌وقت یا ۲۸۰ روز پاره‌وقت در سال' },
  { icon: '🔓', title: 'اقامت پس از تحصیل', text: '۱۸ ماه فرصت برای یافتن کار و مسیر اقامت دائم' },
];

export default function Education({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section id="education" className="section-padding bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow={dict.nav.education}
          title={dict.nav.education}
          subtitle="چرا تحصیل در آلمان؟"
        />

        <div className="mx-auto mb-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="card-hover rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 text-center shadow-soft"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-soft">
                {h.icon}
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">{h.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{h.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href={`/${locale}/guide`}
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-700"
          >
            📖 مطالعه راهنمای جامع تحصیل در آلمان
          </Link>
        </div>
      </div>
    </section>
  );
}
