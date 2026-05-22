'use client';

import { useEffect, useState } from 'react';
import type { Dictionary } from '@/lib/i18n';

export default function ReviewModal({
  open,
  onClose,
  dict,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  dict: Dictionary;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const reset = () => {
    setRating(5);
    setName('');
    setEmail('');
    setTitle('');
    setContent('');
    setMsg(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: name,
          authorEmail: email || null,
          rating,
          title: title || null,
          content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'error');

      setMsg(dict.reviewForm.success);
      onSubmitted();
      window.setTimeout(() => {
        reset();
        onClose();
      }, 1600);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'خطا';
      setMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 id="review-modal-title" className="text-xl font-bold text-slate-900">
            {dict.reviewForm.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={dict.reviewForm.cancel}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">{dict.reviewForm.rating}</label>
            <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label={dict.reviewForm.rating}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`star rounded-md px-1 py-0.5 text-3xl leading-none ${value <= rating ? 'active' : ''}`}
                  aria-pressed={value <= rating}
                  aria-label={`${value} از 5`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="review-name">
              {dict.reviewForm.name}
            </label>
            <input
              id="review-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="review-email">
              {dict.reviewForm.email}
            </label>
            <input
              id="review-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="review-title">
              {dict.reviewForm.titleField}
            </label>
            <input
              id="review-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="review-content">
              {dict.reviewForm.content}
            </label>
            <textarea
              id="review-content"
              required
              minLength={10}
              maxLength={2000}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              className={inputClass}
            />
          </div>

          {msg && (
            <p
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              aria-live="polite"
            >
              {msg}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {dict.reviewForm.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '...' : dict.reviewForm.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
