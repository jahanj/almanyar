import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { localePath } from '@/lib/i18n';

/**
 * Homepage trust section. Sits between the cinematic hero and Services.
 *
 * Four short claims, each verifiable on /fa/how-it-works. Intentionally
 * minimal — anything beyond four lines starts feeling like marketing.
 *
 * Claims source: PHASE-2-PLAN §POSITIONING-02. Wording stays in sync with
 * positioning-content.ts whyBullets so visible page + JSON-LD never drift.
 */
const POINTS = [
  'پذیرش دانشگاه ترکیه: کاملاً رایگان، بدون پیش‌پرداخت',
  'شهریه دانشگاه: مستقیم به حساب دانشگاه (هرگز از طریق ما)',
  'پرداخت خدمات استقرار: فقط بعد از قرارداد و فقط برای کارهای انجام‌شده',
  'مسیر آلمان: همراهی شفاف، بدون وعده‌های دروغ',
] as const;

export default function TrustModel({ locale }: { locale: Locale }) {
  return (
    <section
      aria-labelledby="trust-model-title"
      className="bg-emerald-50/60 py-14 md:py-20"
      data-testid="trust-model"
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <h2 id="trust-model-title" className="text-center text-2xl font-bold text-emerald-900 md:text-3xl">
          چرا آلمانیار؟
        </h2>

        <ul className="mx-auto mt-8 grid gap-3 md:max-w-2xl">
          {POINTS.map((p) => (
            <li
              key={p}
              className="flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-white p-4 shadow-soft md:p-5"
            >
              <span aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-600">✅</span>
              <span className="leading-7 text-slate-700">{p}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <Link
            href={localePath(locale, '/how-it-works')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-900 hover:underline"
          >
            نحوه کار ما را ببینید <span aria-hidden="true">←</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
