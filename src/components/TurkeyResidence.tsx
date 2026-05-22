import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';
import SectionHeader from './SectionHeader';

const steps = [
  { icon: '✈️', title: 'قبل از ورود', text: 'پذیرش دانشگاه، ویزا، آپوستیل و ترجمه مدارک' },
  { icon: '🛬', title: 'بدو ورود', text: 'شماره مالیاتی، گواهی دانشجویی، قرارداد اجاره' },
  { icon: '🖥️', title: 'درخواست e-ikamet', text: 'ثبت در سامانه، نوبت‌دهی و پرداخت هزینه' },
  { icon: '📮', title: 'صدور کارت', text: 'دوره انتظار، رهگیری PTT و دریافت کارت اقامت' },
];

export default function TurkeyResidence({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section id="turkey-residence" className="section-padding bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="🇹🇷"
          title={dict.nav.turkey}
          subtitle="مسیر اخذ اقامت دانشجویی (Öğrenci İkamet İzni) در ترکیه"
        />

        <div className="mx-auto mb-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.title}
              className="card-hover rounded-2xl border border-red-100 bg-white p-6 text-center shadow-soft"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl">
                {s.icon}
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">{s.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/${locale}/turkey-residence`}
            className="inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-8 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-red-700 sm:w-auto"
          >
            🇹🇷 راهنمای کامل اقامت تحصیلی ترکیه
          </Link>
          <Link
            href={`/${locale}/turkey-costs`}
            className="inline-flex w-full items-center justify-center rounded-xl border border-red-200 bg-white px-8 py-3.5 text-sm font-semibold text-red-700 shadow-soft transition hover:bg-red-50 sm:w-auto"
          >
            💰 هزینه زندگی در ترکیه
          </Link>
        </div>
      </div>
    </section>
  );
}
