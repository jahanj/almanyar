'use client';

import { useState } from 'react';
import Link from 'next/link';
import ResendVerification from '@/components/ResendVerification';

const fieldClassName =
  'mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    marketingConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'ثبت نام ناموفق');
      setRegistered(true);
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'خطا');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl md:p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">📧</div>
          <p className="text-sm font-medium text-slate-500">ثبت‌نام انجام شد</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">ثبت‌نام موفق بود</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            یک ایمیل تایید به <span className="font-medium text-slate-950">{form.email}</span> فرستادیم.
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600">برای فعال شدن کامل حساب، روی لینک داخل ایمیل کلیک کنید.</p>
          <div className="mt-6">
            <ResendVerification email={form.email} />
          </div>
          <Link href="/login" className="mt-6 inline-block font-medium text-slate-950 underline-offset-4 hover:underline">
            رفتن به صفحه ورود
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">شروع کنید</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">ثبت‌نام</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">اطلاعات اولیه را وارد کنید تا حساب شما ساخته شود.</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="register-name">
              نام و نام خانوادگی
            </label>
            <input
              id="register-name"
              required
              minLength={2}
              autoComplete="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className={fieldClassName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="register-email">
              ایمیل
            </label>
            <input
              id="register-email"
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className={fieldClassName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="register-phone">
              تلفن (اختیاری)
            </label>
            <input
              id="register-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className={fieldClassName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="register-password">
              رمز عبور
            </label>
            <input
              id="register-password"
              required
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className={fieldClassName}
            />
            <p className="mt-1 text-xs text-slate-500">حداقل ۸ کاراکتر</p>
          </div>

          {/* Phase-4 §5 — marketing opt-in. Unchecked by default (GDPR). */}
          <label
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
            data-testid="register-marketing-wrap"
          >
            <input
              type="checkbox"
              checked={form.marketingConsent}
              onChange={(event) => setForm({ ...form, marketingConsent: event.target.checked })}
              className="mt-1 h-4 w-4 rounded border-slate-400 text-slate-950 focus:ring-slate-950"
              data-testid="register-marketing"
            />
            <span className="leading-7">
              موافقم گاه‌به‌گاه راهنماها و اطلاعات مفید آلمانیار را از طریق ایمیل دریافت کنم.
              <span className="block text-xs text-slate-500">اختیاری — هر زمان می‌توانید با یک کلیک لغو کنید.</span>
            </span>
          </label>

          {err && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" aria-live="polite">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-3.5 text-base font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
          >
            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          حساب دارید؟{' '}
          <Link href="/login" className="font-medium text-slate-950 underline-offset-4 hover:underline">
            وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}
