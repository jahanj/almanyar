import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { localePath } from '@/lib/i18n';

/**
 * Homepage trust section. Sits between the cinematic hero and Services.
 *
 * Three cards, each tied to a verifiable claim:
 *  1. Why-Turkey framing (German-embassy-in-Tehran closure → Turkey route)
 *  2. Free admission + no-tuition-through-us pricing model
 *  3. Real lived experience (6 years in Turkey, 20+ students)
 *
 * Wording is the spec's literal copy from PHASE-3-PLAN §TRUST-06. The
 * fourth element (a single "بیشتر درباره ما" CTA below the cards) lands
 * the visitor on /fa/about for the full owner story.
 */
const CARDS = [
  {
    icon: '🇹🇷',
    title: 'ترکیه به‌عنوان پل آماده‌سازی',
    body:
      'سفارت آلمان در تهران بسته است. ترکیه راه‌حل عملی شماست: ورود آسان، ۶ ماه فرصت برای آماده‌سازی زبان و مدارک، و سفارت قابل دسترس‌تر در آنکارا و استانبول.',
  },
  {
    icon: '🔓',
    title: 'پذیرش دانشگاه ترکیه — کاملاً رایگان',
    body:
      'هیچ پولی برای پذیرش دریافت نمی‌کنیم. شهریه را مستقیماً خودتان به حساب دانشگاه واریز می‌کنید — هرگز از طریق ما.',
  },
  {
    icon: '🤝',
    title: '۶ سال تجربه واقعی در ترکیه',
    body:
      'من خودم در ترکیه زندگی می‌کنم و در دانشگاه مدیپل تحصیل می‌کنم. بیش از ۲۰ دانشجو را در این مسیر همراهی کرده‌ام.',
  },
] as const;

export default function TrustModel({ locale }: { locale: Locale }) {
  return (
    <section
      aria-labelledby="trust-model-title"
      className="bg-emerald-50/60 py-14 md:py-20"
      data-testid="trust-model"
    >
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <h2
          id="trust-model-title"
          className="text-center text-2xl font-bold text-emerald-900 md:text-3xl"
        >
          چرا آلمانیار؟
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {CARDS.map((c) => (
            <article
              key={c.title}
              className="flex flex-col rounded-2xl border border-emerald-200/70 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <span aria-hidden="true" className="text-3xl">{c.icon}</span>
              <h3 className="mt-4 text-lg font-bold text-emerald-900">{c.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">{c.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={localePath(locale, '/about')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-900 hover:underline"
          >
            بیشتر درباره ما <span aria-hidden="true">←</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
