'use client';

import { useEffect, useMemo, useState } from 'react';

/**
 * Phase-8G — modal picker for inserting internal links in the editor.
 *
 * Fetches every available target once on open (posts + topics + static
 * pages, ~50 entries) so the search filter is purely client-side and
 * instant. Click an item → calls `onPick(href, title)` and closes.
 */

export interface LinkTarget {
  type: 'post' | 'topic' | 'page';
  title: string;
  href: string;
  label?: string;
}

const TYPE_ICON: Record<LinkTarget['type'], string> = {
  post: '📰',
  topic: '📖',
  page: '🏠',
};

export default function InternalLinkPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (href: string, title: string) => void;
}) {
  const [targets, setTargets] = useState<LinkTarget[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void fetch('/api/admin/internal-links')
      .then((r) => r.json())
      .then((d) => setTargets(d.targets ?? []))
      .catch(() => setTargets([]))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return targets;
    return targets.filter((t) =>
      t.title.toLowerCase().includes(needle) ||
      t.href.toLowerCase().includes(needle),
    );
  }, [targets, q]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-20"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-lg font-bold text-slate-900">درج لینک داخلی</h2>
          <p className="mt-1 text-xs text-slate-500">
            یکی از پست‌ها، راهنماها یا صفحه‌های سایت را برای لینک انتخاب کنید.
          </p>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو در عنوان‌ها…"
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {loading ? (
            <p className="p-6 text-center text-sm text-slate-500">در حال بارگذاری…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">چیزی پیدا نشد.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <li key={t.href}>
                  <button
                    type="button"
                    onClick={() => { onPick(t.href, t.title); onClose(); }}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-right transition hover:bg-emerald-50"
                  >
                    <span className="text-lg" aria-hidden="true">{TYPE_ICON[t.type]}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {t.title}
                      </span>
                      <span className="block truncate text-xs text-slate-500" dir="ltr">
                        {t.href}
                        {t.label ? ` · ${t.label}` : ''}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 p-3 text-xs text-slate-500">
          <span>{filtered.length} مورد</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50"
          >انصراف</button>
        </div>
      </div>
    </div>
  );
}
