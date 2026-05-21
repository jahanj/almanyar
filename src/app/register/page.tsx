'use client';

import { useState } from 'react';
import Link from 'next/link';
import ResendVerification from '@/components/ResendVerification';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
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
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'خطا');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold mb-3 gradient-text">ثبت‌نام موفق بود</h1>
          <p className="text-gray-600 mb-2">
            یک ایمیل تایید به <span className="font-medium">{form.email}</span> فرستادیم.
          </p>
          <p className="text-gray-600 mb-6">برای فعال شدن کامل حساب، روی لینک داخل ایمیل کلیک کنید.</p>
          <div className="mb-6"><ResendVerification email={form.email} /></div>
          <Link href="/login" className="text-blue-600 hover:underline">رفتن به صفحه ورود</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 gradient-text">ثبت نام</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">نام و نام خانوادگی</label>
            <input
              required minLength={2}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ایمیل</label>
            <input
              required type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تلفن (اختیاری)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رمز عبور</label>
            <input
              required type="password" minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">حداقل ۸ کاراکتر</p>
          </div>
          {err && <p className="text-red-700 text-sm bg-red-50 p-2 rounded">{err}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg"
          >
            {loading ? '...' : 'ثبت نام'}
          </button>
        </form>
        <p className="text-center text-sm mt-5 text-gray-600">
          حساب دارید؟{' '}
          <Link href="/login" className="text-blue-600 hover:underline">وارد شوید</Link>
        </p>
      </div>
    </div>
  );
}
