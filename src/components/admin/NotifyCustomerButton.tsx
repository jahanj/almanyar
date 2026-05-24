'use client';

import { useState } from 'react';

function timeAgoFa(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'لحظاتی پیش';
  if (min < 60) return `${min} دقیقه پیش`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ساعت پیش`;
  return `${Math.floor(hr / 24)} روز پیش`;
}

/**
 * Phase-4 §4 — reusable "send adminNotes to the lead" button.
 *
 * Used on /admin/contacts, /admin/evaluations, /admin/applications
 * cards. POSTs to /api/admin/<table>/[id]/notify (each table has a
 * thin route that delegates to handleNotify in lib/admin-notify.ts).
 *
 * Pass:
 *  - `apiPath`         : the /notify endpoint for THIS card.
 *  - `unsavedMessage`  : optional textarea override; if non-empty it's
 *                        sent instead of the stored adminNotes.
 *  - `lastNotifiedAt`  : ISO; renders "آخرین ارسال: X روز پیش" if set.
 *  - `onSent`          : parent re-loads list (and pulls fresh
 *                        lastNotifiedAt).
 *
 * Confirms before sending (irreversible action). On 429 / 502 / 4xx,
 * surfaces the server's Persian error message via alert(). Disabled
 * while the request is in flight.
 */
export default function NotifyCustomerButton({
  apiPath,
  unsavedMessage,
  lastNotifiedAt,
  onSent,
}: {
  apiPath: string;
  unsavedMessage?: string;
  lastNotifiedAt?: string | null;
  onSent?: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (busy) return;
    if (!confirm('ارسال یادداشت فعلی به ایمیل مشتری؟ این عمل قابل بازگشت نیست.')) return;
    setBusy(true);
    try {
      const message = (unsavedMessage ?? '').trim();
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message ? { message } : {}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as { error?: string }));
        alert(data.error ?? `ارسال ناموفق (HTTP ${res.status})`);
        return;
      }
      alert('یادداشت برای مشتری ارسال شد.');
      onSent?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={send}
        disabled={busy}
        className="text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-3 py-1 rounded"
        title="ارسال یادداشت ذخیره‌شده (یا متن فعلی) به ایمیل مشتری"
        data-testid="admin-notify-customer"
      >
        {busy ? '...' : '📧 ارسال به مشتری'}
      </button>
      {lastNotifiedAt && (
        <span className="text-xs text-gray-500">
          آخرین ارسال: {timeAgoFa(lastNotifiedAt)}
        </span>
      )}
    </span>
  );
}
