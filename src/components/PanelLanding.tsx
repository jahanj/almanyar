import Link from 'next/link';

/**
 * Phase-5 TASK-07 (Decision E) — sits between TrustModel and Services.
 *
 * Story it tells: "you and your consultant share one panel; this is
 * what it looks like." Static mock — no live data, no auth, no
 * fetches; it's a screenshot-in-HTML so the homepage stays fast.
 *
 * The mock shows two paired views — the student's roadmap on the right
 * and what the consultant sees on the left — to make the
 * "co-managed" angle obvious at a glance.
 */
export default function PanelLanding() {
  return (
    <section
      className="py-16 md:py-20 bg-gradient-to-b from-white to-slate-50"
      dir="rtl"
      data-testid="panel-landing"
    >
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full mb-3">
            ویژگی جدید
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            پنل مشترک شما و مشاورتان
          </h2>
          <p className="text-gray-600 leading-relaxed">
            هر گام مهاجرت‌تان را همراه مشاور آلمانیار در یک پنل پیگیری کنید:
            مشاور وظیفه‌ها را تعریف می‌کند، شما انجامشان را علامت می‌زنید،
            و هر تأیید نهایی با یک ایمیل به اطلاع شما می‌رسد.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <MockCard
            label="نمای مشاور"
            tone="blue"
            rows={[
              { title: 'افتتاح حساب مسدودی', state: 'انجام شد', dot: 'bg-emerald-500' },
              { title: 'ثبت‌نام دانشگاه TU Berlin', state: 'منتظر تأیید', dot: 'bg-amber-500' },
              { title: 'نوبت سفارت آلمان', state: 'در حال انجام', dot: 'bg-blue-500' },
              { title: 'بیمه درمانی', state: 'در انتظار', dot: 'bg-gray-300' },
            ]}
            caption="مشاور می‌تواند گام‌ها را اضافه، ویرایش یا تأیید کند."
          />
          <MockCard
            label="نمای شما"
            tone="emerald"
            rows={[
              { title: 'افتتاح حساب مسدودی', state: '✓ تأیید شد', dot: 'bg-emerald-500', checked: true },
              { title: 'ثبت‌نام دانشگاه TU Berlin', state: '⏳ منتظر مشاور', dot: 'bg-amber-500', checked: true },
              { title: 'نوبت سفارت آلمان', state: 'انجام دادم', dot: 'bg-blue-500' },
              { title: 'بیمه درمانی', state: '', dot: 'bg-gray-300' },
            ]}
            caption="شما با یک تیک اعلام می‌کنید گامی را انجام داده‌اید."
          />
        </div>

        <div className="text-center mt-10">
          <Link
            href="/login?callbackUrl=/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg"
          >
            ورود به پنل کاربری
          </Link>
          <p className="text-xs text-gray-500 mt-2">
            ابتدا حساب رایگان بسازید — پس از ارزیابی، مشاور پنل شما را راه‌اندازی می‌کند.
          </p>
        </div>
      </div>
    </section>
  );
}

function MockCard({
  label,
  tone,
  rows,
  caption,
}: {
  label: string;
  tone: 'blue' | 'emerald';
  rows: Array<{ title: string; state: string; dot: string; checked?: boolean }>;
  caption: string;
}) {
  const headerCls = tone === 'blue'
    ? 'bg-blue-50 border-blue-100 text-blue-900'
    : 'bg-emerald-50 border-emerald-100 text-emerald-900';

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className={`px-4 py-2 text-xs font-medium border-b ${headerCls}`}>
        {label}
      </div>
      <ol className="p-4 space-y-2.5">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${r.dot}`} aria-hidden="true" />
            <span className="flex-1 text-gray-800">{r.title}</span>
            {r.checked !== undefined && (
              <input
                type="checkbox"
                checked={r.checked}
                readOnly
                className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                aria-hidden="true"
                tabIndex={-1}
              />
            )}
            <span className="text-xs text-gray-500 whitespace-nowrap">{r.state}</span>
          </li>
        ))}
      </ol>
      <p className="px-4 pb-4 text-xs text-gray-500">{caption}</p>
    </div>
  );
}
