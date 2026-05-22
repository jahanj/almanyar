'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Lightweight cookie notice — a non-blocking bottom bar, not a modal.
 *
 * Dismissal rules (PHASE-2-PLAN §LEGAL-03 + user ack §H):
 *  - "متوجه شدم" click → write `{ v, dismissedAt }` to localStorage.
 *  - Closing the tab / navigating away without clicking → notice
 *    reappears on next visit. Session-scoped state is intentional;
 *    we want an explicit consent signal, not a silent eye-roll.
 *  - Re-shows after 12 months OR if STORAGE_VERSION is bumped.
 *
 * No granular toggles — the site doesn't run third-party trackers
 * (see /fa/privacy "کوکی‌ها"). If/when analytics ships, the consent
 * model needs to grow up; until then, simpler is more honest.
 */

const STORAGE_KEY = 'almanyar_cookie_notice_dismissed_v1';
const STORAGE_VERSION = 1;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

type Persisted = { v: number; dismissedAt: number };

export default function CookieNotice({ locale }: { locale: string }) {
  // Default false → server-render shows nothing; client hydrates then
  // decides. Prevents a flash of the bar on every load.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        const fresh =
          parsed.v === STORAGE_VERSION &&
          Date.now() - parsed.dismissedAt < ONE_YEAR_MS;
        if (fresh) return; // stay hidden
      }
    } catch {
      /* corrupt entry — treat as not-yet-dismissed */
    }
    setVisible(true);
  }, []);

  function dismiss() {
    try {
      const payload: Persisted = { v: STORAGE_VERSION, dismissedAt: Date.now() };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* private mode / quota — accept the silent click; bar still hides this session */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="اعلان کوکی"
      data-testid="cookie-notice"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-card sm:p-5"
    >
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="leading-7">
          این سایت از کوکی‌ها برای بهبود تجربه شما استفاده می‌کند.{' '}
          <Link
            href={`/${locale}/privacy`}
            className="font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            بیشتر بدانید
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          متوجه شدم
        </button>
      </div>
    </div>
  );
}
