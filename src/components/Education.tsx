import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';

const highlights = [
  { icon: '🆓', title: 'تحصیل رایگان', text: 'در دانشگاه‌های دولتی، فقط هزینه ثبت‌نام ۱۵۰-۳۵۰ یورو در ترم' },
  { icon: '🌍', title: 'مدرک بین‌المللی', text: 'مدارک شناخته‌شده در سطح جهانی و کیفیت بالای آموزش' },
  { icon: '💼', title: 'کار حین تحصیل', text: '۱۴۰ روز تمام‌وقت یا ۲۸۰ روز پاره‌وقت در سال' },
  { icon: '🔓', title: 'اقامت پس از تحصیل', text: '۱۸ ماه فرصت برای یافتن کار و مسیر اقامت دائم' },
];

export default function Education({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section id="education" className="section-padding bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">{dict.nav.education}</h2>
          <p className="text-xl text-gray-600">چرا تحصیل در آلمان؟</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-10">
          {highlights.map((h, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl p-6 text-center card-hover">
              <div className="text-4xl mb-3 floating-animation">{h.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{h.title}</h3>
              <p className="text-gray-600 text-sm leading-7">{h.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href={`/${locale}/guide`}
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold py-4 px-10 rounded-xl transition transform hover:scale-105 shadow-lg"
          >
            📖 مطالعه راهنمای جامع تحصیل در آلمان
          </Link>
        </div>
      </div>
    </section>
  );
}
