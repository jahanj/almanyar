import Link from 'next/link';

/**
 * Phase-9 §4 — Visual journey roadmap.
 *
 * 6 stages from arrival in Turkey to settlement in Germany. Dark
 * navy gradient background — emotional anchor of the page.
 *
 * Desktop: horizontal stepped timeline (3-column row on lg+, 2x3
 * grid on md, single column on sm to keep readability).
 * Connector dots between cards on lg+.
 *
 * Each step deep-links to a relevant topic page per the locked
 * Phase-9 brief.
 *
 * No GSAP — pure CSS transitions on hover; the "scroll reveal" is
 * native browser behavior. Keeps this section light.
 */

interface Stage {
  number: number;
  title: string;
  description: string;
  href: string;
}

const STAGES: Stage[] = [
  {
    number: 1,
    title: 'ورود به ترکیه',
    description: 'اقامت تحصیلی، iqamet، اسکان اولیه در استانبول/آنکارا.',
    href: '/fa/turkey-residence',
  },
  {
    number: 2,
    title: 'آماده‌سازی مدارک',
    description: 'ترجمه‌ی رسمی، تأیید سفارت، مدارک uni-assist.',
    href: '/fa/germany-visa/documents',
  },
  {
    number: 3,
    title: 'آزمون زبان',
    description: 'Goethe، telc یا TestDaF — B1 تا C1 بسته به مسیر.',
    href: '/fa/exams',
  },
  {
    number: 4,
    title: 'وقت سفارت آلمان',
    description: 'iDATA، VisaMetric، مصاحبه‌ی سفارت در ترکیه.',
    href: '/fa/germany-visa/appointment-from-turkey',
  },
  {
    number: 5,
    title: 'پرواز به آلمان',
    description: 'ورود قانونی، ثبت آدرس (Anmeldung)، باز کردن حساب.',
    href: '/fa/life-germany/housing',
  },
  {
    number: 6,
    title: 'استقرار و اقامت',
    description: 'بیمه، Aufenthaltstitel، شروع تحصیل/کار.',
    href: '/fa/study-germany/post-study-residence',
  },
];

export default function JourneyTimeline() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-24 text-white md:py-32"
      dir="rtl"
      aria-labelledby="journey-timeline-title"
    >
      {/* Subtle background glow */}
      <div
        className="absolute inset-x-0 top-0 h-64 opacity-30"
        style={{ background: 'radial-gradient(ellipse at top, rgba(16,185,129,0.25), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
            نقشه‌راه
          </p>
          <h2
            id="journey-timeline-title"
            className="mt-3 text-balance text-3xl font-bold md:text-4xl"
          >
            از ترکیه تا آلمان، در ۶ گام
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-300">
            یک مسیر آشنا برای کسی که قبلاً پیموده است — تا شما تنها نباشید.
          </p>
        </div>

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((s) => (
            <li key={s.number}>
              <Link
                href={s.href}
                className="group block h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-emerald-400/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-base font-bold text-emerald-300 ring-1 ring-emerald-400/40"
                    aria-hidden="true"
                  >
                    {toFa(s.number)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-white group-hover:text-emerald-200">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300/85">
                      {s.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-300 transition group-hover:gap-2">
                      بیشتر بدانید <span aria-hidden="true">←</span>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function toFa(n: number): string {
  return n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]!);
}
