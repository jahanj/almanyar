'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    setMsg(data.message ?? data.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2 gradient-text">بازیابی رمز عبور</h1>
        <p className="text-sm text-gray-500 text-center mb-6">ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود.</p>
        <form onSubmit={submit} className="space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ایمیل" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          {msg && <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded">{msg}</p>}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg">
            {loading ? '...' : 'ارسال لینک بازیابی'}
          </button>
        </form>
        <p className="text-center text-sm mt-5 text-gray-600">
          <Link href="/login" className="text-blue-600 hover:underline">بازگشت به ورود</Link>
        </p>
      </div>
    </div>
  );
}
