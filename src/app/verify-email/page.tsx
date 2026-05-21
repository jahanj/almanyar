'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) { setState('error'); setMsg('توکن یافت نشد'); return; }
    fetch('/api/auth/verify-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const d = await r.json();
        if (r.ok) { setState('ok'); setMsg(d.message); }
        else { setState('error'); setMsg(d.error ?? 'خطا'); }
      })
      .catch(() => { setState('error'); setMsg('خطای ارتباط'); });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="text-5xl mb-4">{state === 'loading' ? '⏳' : state === 'ok' ? '✅' : '❌'}</div>
        <h1 className="text-2xl font-bold mb-3">تایید ایمیل</h1>
        <p className="text-gray-600 mb-6">{state === 'loading' ? 'در حال بررسی...' : msg}</p>
        <Link href="/login" className="text-blue-600 hover:underline">رفتن به صفحه ورود</Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center">...</div>}><VerifyContent /></Suspense>;
}
