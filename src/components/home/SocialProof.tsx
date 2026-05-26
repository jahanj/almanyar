import Link from 'next/link';

/**
 * Phase-9 §5 — Social proof.
 *
 * One featured large testimonial + two secondary cards. Replaces the
 * Phase-7-era full Testimonials feed (which was retired in Phase 8F
 * and is now reintroduced in a curated form).
 *
 * Curation note: the testimonials shown here are HAND-PICKED — they
 * are the strongest stories, not the most recent. A full review feed
 * lives at /fa/reviews (Phase-9 follow-up).
 */

interface Testimonial {
  name: string;
  role: string;
  journeyBadge: string; // "Tehran ✈ Istanbul ✈ Berlin"
  quote: string;
  /** Initials shown when no photo is supplied. */
  initials: string;
}

const FEATURED: Testimonial = {
  name: 'علی محمدی',
  role: 'دانشجوی ارشد مهندسی، TU Berlin',
  journeyBadge: 'تهران ← استانبول ← برلین',
  quote:
    'سفارت آلمان از تهران چندین ماه طول می‌کشید. با مسیر ترکیه و راهنمایی آلمانیار، در ۹ ماه از تصمیم تا ورود به آلمان رسیدم. مدارک، زبان، سفارت — هر مرحله یک checklist روشن داشت.',
  initials: 'ع.م',
};

const SECONDARY: Testimonial[] = [
  {
    name: 'مریم احمدی',
    role: 'دانشجوی پزشکی',
    journeyBadge: 'اصفهان ← آنکارا ← فرانکفورت',
    quote:
      'پشتیبانی واقعی یعنی این — وقتی سفارت نوبت نمی‌داد، خودشان آلترناتیو پیدا کردند.',
    initials: 'م.ا',
  },
  {
    name: 'حسین رضایی',
    role: 'برنامه‌نویس، EU Blue Card',
    journeyBadge: 'تهران ← استانبول ← مونیخ',
    quote:
      'تنها مشاوری بود که زمان‌بندی واقعی به من داد، نه وعده‌ی غیرواقعی.',
    initials: 'ح.ر',
  },
];

export default function SocialProof() {
  return (
    <section
      className="bg-white py-20 md:py-28"
      dir="rtl"
      aria-labelledby="social-proof-title"
    >
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
            تجربه‌های واقعی
          </p>
          <h2
            id="social-proof-title"
            className="mt-3 text-balance text-3xl font-bold text-slate-900 md:text-4xl"
          >
            دانشجویانی که این مسیر را پیمودند
          </h2>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500">
            <span className="text-amber-500">★ ★ ★ ★ ★</span>
            <span>۴.۹ از ۵ بر اساس ۲۵۰+ تجربه</span>
          </p>
        </div>

        {/* Featured */}
        <figure className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-8 shadow-soft md:p-10">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
              {FEATURED.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-slate-900">{FEATURED.name}</p>
              <p className="text-sm text-slate-500">{FEATURED.role}</p>
            </div>
            <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-white">
              {FEATURED.journeyBadge}
            </span>
          </div>
          <blockquote className="mt-6 text-balance text-lg leading-9 text-slate-800 md:text-xl">
            «{FEATURED.quote}»
          </blockquote>
        </figure>

        {/* Secondary */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {SECONDARY.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                  {t.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">{t.journeyBadge}</p>
              <blockquote className="mt-3 text-sm leading-7 text-slate-700">
                «{t.quote}»
              </blockquote>
            </figure>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/fa/reviews"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 transition hover:gap-2"
          >
            همه‌ی تجربه‌ها <span aria-hidden="true">←</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
