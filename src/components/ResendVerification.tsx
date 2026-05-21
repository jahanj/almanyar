'use client';

import { useState } from 'react';

export default function ResendVerification({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const resend = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMsg(data.message ?? data.error ?? 'انجام شد');
    } catch {
      setMsg('خطای ارتباط. دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={resend}
        disabled={loading}
        className="text-blue-600 hover:underline disabled:opacity-50 font-medium"
      >
        {loading ? 'در حال ارسال...' : 'ارسال مجدد لینک تایید'}
      </button>
      {msg && <p className="text-sm text-gray-600 mt-2">{msg}</p>}
    </div>
  );
}
