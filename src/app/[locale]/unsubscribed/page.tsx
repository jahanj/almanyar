import type { Metadata } from 'next';
import Link from 'next/link';
import { localePath, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return pageMetadata({
    locale: params.locale,
    path: '/unsubscribed',
    title: 'لغو عضویت — آلمانیار',
    description: 'عضویت شما در فهرست خبرنامه آلمانیار لغو شد.',
    noindex: true,
  });
}

export default function UnsubscribedPage({ params }: { params: { locale: Locale } }) {
  return (
    <main className="container mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <div className="rounded-3xl border border-emerald-200/70 bg-white p-8 shadow-soft md:p-12">
        <div aria-hidden="true" className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-emerald-900 md:text-3xl">
          عضویت لغو شد
        </h1>
        <p className="mt-3 leading-8 text-slate-700">
          از این پس ایمیل تبلیغاتی یا خبرنامه از آلمانیار دریافت نخواهید کرد. ممنون که زمان گذاشتید.
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          توجه: اگر در حال حاضر پرونده‌ای فعال در آلمانیار دارید، ایمیل‌های مرتبط با پرونده (مثل به‌روزرسانی وضعیت) همچنان برای شما ارسال می‌شود — این صرفاً لغو عضویت از خبرنامه است.
        </p>
        <div className="mt-8">
          <Link
            href={localePath(params.locale)}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-800"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </main>
  );
}
