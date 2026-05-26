import Link from 'next/link';

/**
 * Phase-9 §2 — Three Paths card row.
 *
 * Visitor self-identifies their journey type in one screen.
 * Three equal cards on desktop, stacked on mobile.
 *
 * Hover: 4px lift + accent border-top slides in (~150ms).
 * Accent color per card is tuned to the topic group it links to.
 */

interface Path {
  id: 'study' | 'ausbildung' | 'work';
  icon: string;
  title: string;
  lead: string;
  bullets: string[];
  href: string;
  /** Accent class for hover border-top + icon background. */
  accent: string;
  /** Soft tinted background for the icon tile. */
  iconBg: string;
}

const PATHS: Path[] = [
  {
    id: 'study',
    icon: '🎓',
    title: 'تحصیل در آلمان',
    lead: 'کارشناسی، ارشد و دکتری از دانشگاه‌های دولتی آلمان.',
    bullets: ['انتخاب دانشگاه + رشته', 'مسیر uni-assist', 'ویزای دانشجویی نوع D'],
    href: '/fa/study-germany',
    accent: 'group-hover:border-t-blue-500',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  },
  {
    id: 'ausbildung',
    icon: '🛠️',
    title: 'اوسبیلدونگ',
    lead: 'آموزش فنی-حرفه‌ای با پرداختی ماهانه از کارفرما.',
    bullets: ['مدارک و معادل‌سازی', 'زبان B1/B2', 'ویزای کارآموزی'],
    href: '/fa/ausbildung/visa',
    accent: 'group-hover:border-t-amber-500',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
  },
  {
    id: 'work',
    icon: '💼',
    title: 'مهاجرت کاری',
    lead: 'Opportunity Card، Job Seeker Visa، EU Blue Card.',
    bullets: ['ارزیابی مدارک', 'یافتن کارفرما', 'ویزای کاری'],
    href: '/fa/work-germany',
    accent: 'group-hover:border-t-emerald-500',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
];

export default function ThreePaths() {
  return (
    <section
      className="bg-white py-20 md:py-28"
      dir="rtl"
      aria-labelledby="three-paths-title"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
            مسیر خود را انتخاب کنید
          </p>
          <h2
            id="three-paths-title"
            className="mt-3 text-balance text-3xl font-bold text-slate-900 md:text-4xl"
          >
            از کجا شروع می‌کنید؟
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            سه مسیر اصلی برای حضور در آلمان. هرکدام مدارک، زمان‌بندی و ویزای متفاوتی دارند.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PATHS.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className={`group relative flex flex-col rounded-2xl border border-slate-200 border-t-4 border-t-transparent bg-white p-7 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-card ${p.accent}`}
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white shadow-sm ${p.iconBg}`}
                aria-hidden="true"
              >
                {p.icon}
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{p.lead}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 transition group-hover:gap-2">
                مشاهده مسیر
                <span aria-hidden="true">←</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
