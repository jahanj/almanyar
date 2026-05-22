'use client';

import { useState } from 'react';
import { examGroups } from '@/lib/exams-data';

// Flattened exam options for the dropdown (provider + level).
const EXAM_OPTIONS = examGroups.flatMap((g) => g.levels);

export default function ExamRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const exam = String(fd.get('exam') || '');
    const city = String(fd.get('city') || '').trim();
    const notes = String(fd.get('notes') || '').trim();

    setLoading(true);
    setMsg(null);
    setErr(null);

    // Compose a single message for the existing contact pipeline.
    const message =
      `درخواست ثبت‌نام آزمون: ${exam || 'نامشخص'}` +
      (city ? `\nشهر/مرکز موردنظر: ${city}` : '') +
      (notes ? `\nتوضیحات: ${notes}` : '');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fd.get('fullName'),
          email: fd.get('email'),
          phone: fd.get('phone') || null,
          subject: `ثبت‌نام آزمون ${exam}`.slice(0, 200),
          message,
          serviceType: 'OTHER',
          website: fd.get('website') || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'ثبت درخواست ناموفق بود');
      setMsg('درخواست شما ثبت شد. کارشناسان آلمانیار به‌زودی برای ثبت‌نام آزمون با شما تماس می‌گیرند.');
      e.currentTarget.reset();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'خطا در ثبت درخواست');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-5">
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">نام و نام خانوادگی</label>
          <input name="fullName" required minLength={2} maxLength={120}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ایمیل</label>
          <input name="email" type="email" required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">شماره تماس / واتساپ</label>
          <input name="phone" type="tel"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">آزمون موردنظر</label>
          <select name="exam" required defaultValue=""
            className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="" disabled>یک آزمون انتخاب کنید…</option>
            {EXAM_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
            <option value="مشاوره برای انتخاب آزمون">هنوز مطمئن نیستم — راهنمایی می‌خواهم</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">شهر یا مرکز موردنظر (اختیاری)</label>
        <input name="city" maxLength={120} placeholder="مثلاً استانبول، آنکارا…"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">توضیحات (اختیاری)</label>
        <textarea name="notes" rows={3} maxLength={2000} placeholder="سطح فعلی زبان، بازه زمانی موردنظر و هر نکته دیگر…"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>

      {msg && <p className="text-green-700 bg-green-50 p-3 rounded-lg text-sm">{msg}</p>}
      {err && <p className="text-red-700 bg-red-50 p-3 rounded-lg text-sm">{err}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition">
        {loading ? 'در حال ارسال…' : '🎯 درخواست ثبت‌نام آزمون'}
      </button>
      <p className="text-xs text-gray-500 text-center">
        قیمت‌ها تقریبی و بسته به مرکز و تاریخ متغیرند. آلمانیار در ثبت‌نام و پرداخت همراه شماست.
      </p>
    </form>
  );
}
