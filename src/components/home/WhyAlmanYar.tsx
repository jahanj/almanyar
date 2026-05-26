/**
 * Phase-9 §3 — Why AlmanYar trust grid.
 *
 * 4 pillars per the locked brief: transparency, real support, Turkey
 * experience, step-by-step. 2×2 grid on desktop, single column on
 * mobile. Replaces the existing TrustModel (3-card) which is retired.
 */

interface Pillar {
  icon: string;
  title: string;
  description: string;
}

const PILLARS: Pillar[] = [
  {
    icon: '🪟',
    title: 'شفافیت کامل',
    description: 'هزینه‌ها، زمان‌بندی و ریسک‌ها بدون مبهم‌گویی. هر چه می‌دانیم را می‌گوییم.',
  },
  {
    icon: '🤝',
    title: 'پشتیبانی واقعی',
    description: 'یک مشاور انسانی، نه ربات و نه فرم. پاسخ شخصی به هر سؤال.',
  },
  {
    icon: '🇹🇷',
    title: '۶ سال تجربه‌ی واقعی در ترکیه',
    description: 'مسیر pre-Germany را خودمان زندگی کرده‌ایم؛ از iqamet تا سفارت.',
  },
  {
    icon: '📋',
    title: 'راهنمایی گام‌به‌گام',
    description: 'از مدارک تا روز اول در آلمان — یک checklist زنده در پنل شما.',
  },
];

export default function WhyAlmanYar() {
  return (
    <section
      className="bg-[#FAFAF7] py-20 md:py-24"
      dir="rtl"
      aria-labelledby="why-almanyar-title"
    >
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
            چرا آلمانیار
          </p>
          <h2
            id="why-almanyar-title"
            className="mt-3 text-balance text-3xl font-bold text-slate-900 md:text-4xl"
          >
            یک مشاور، نه یک agency بزرگ
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-slate-200/70 bg-white p-7 shadow-soft transition hover:border-emerald-200/80"
            >
              <span className="text-3xl" aria-hidden="true">{p.icon}</span>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
