'use client';

import { useState } from 'react';
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
      setTimeout(() => {
        reset();
        onClose();
      }, 1800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا';
      setMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">{dict.reviewForm.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{dict.reviewForm.rating}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  onClick={() => setRating(i)}
                  className={`star ${i <= rating ? 'active' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{dict.reviewForm.name}</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{dict.reviewForm.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{dict.reviewForm.titleField}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{dict.reviewForm.content}</label>
            <textarea
              required
              minLength={10}
              maxLength={2000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {msg && <p className="text-sm text-blue-700">{msg}</p>}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              {dict.reviewForm.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2 rounded-lg"
            >
              {loading ? '...' : dict.reviewForm.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
