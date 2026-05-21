import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';

const steps = [
  { icon: '✈️', title: 'قبل از ورود', text: 'پذیرش دانشگاه، ویزا، آپوستیل و ترجمه مدارک' },
  { icon: '🛬', title: 'بدو ورود', text: 'شماره مالیاتی، گواهی دانشجویی، قرارداد اجاره' },
  { icon: '🖥️', title: 'درخواست e-ikamet', text: 'ثبت در سامانه، نوبت‌دهی و پرداخت هزینه' },
  { icon: '📮', title: 'صدور کارت', text: 'دوره انتظار، رهگیری PTT و دریافت کارت اقامت' },
];

export default function TurkeyResidence({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section id="turkey-residence" className="section-padding bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="text-4xl mb-2">🇹🇷</div>
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">{dict.nav.turkey}</h2>
          <p className="text-xl text-gray-600">مسیر اخذ اقامت دانشجویی (Öğrenci İkamet İzni) در ترکیه</p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-10">
          {steps.map((s, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-50 to-red-50 rounded-2xl shadow p-6 text-center card-hover">
              <div className="text-4xl mb-3 floating-animation">{s.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
              <p className="text-gray-600 text-sm leading-7">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}/turkey-residence`}
            className="inline-block bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 text-white font-bold py-4 px-10 rounded-xl transition transform hover:scale-105 shadow-lg"
          >
            🇹🇷 راهنمای کامل اقامت تحصیلی ترکیه
          </Link>
          <Link
            href={`/${locale}/turkey-costs`}
            className="inline-block bg-white border-2 border-red-600 text-red-700 hover:bg-red-50 font-bold py-4 px-10 rounded-xl transition transform hover:scale-105 shadow-lg"
          >
            💰 هزینه زندگی در ترکیه
          </Link>
        </div>
      </div>
    </section>
  );
}
