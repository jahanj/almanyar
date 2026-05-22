'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const fieldClassName =
  'mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10';

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setErr(
        res.error === 'LOCKED'
          ? 'حساب شما به‌دلیل تلاش‌های ناموفق موقتاً قفل شده است. ۱۵ دقیقه دیگر دوباره تلاش کنید.'
          : 'ایمیل یا رمز عبور اشتباه است'
      );
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">خوش آمدید</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">ورود به حساب</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            با ایمیل و رمز عبور وارد شوید و ادامه مسیر را دنبال کنید.
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="login-email">
              ایمیل
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClassName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="login-password">
              رمز عبور
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClassName}
            />
          </div>

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
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
          <Link href="/forgot-password" className="inline-block font-medium text-slate-700 underline-offset-4 hover:underline">
            رمز عبور را فراموش کرده‌اید؟
          </Link>
          <p className="text-slate-600">
            حساب ندارید؟{' '}
            <Link href="/register" className="font-medium text-slate-950 underline-offset-4 hover:underline">
              ثبت‌نام کنید
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">...</div>}>
      <LoginContent />
    </Suspense>
  );
}
