'use client';

import { useState } from 'react';
import type { SiteStatsView } from '@/lib/site-stats';

type Field = {
  key: keyof PayloadShape;
  label: string;
  hint?: string;
  step?: number;
};

type PayloadShape = {
  studentsCount: number | null;
  partnerUniversities: number | null;
  successRate: number | null;
  yearsExperience: number | null;
  averageRating: number | null;
  reviewsCount: number | null;
};

const FIELDS: Field[] = [
  { key: 'studentsCount',       label: 'دانشجوی موفق' },
  { key: 'partnerUniversities', label: 'دانشگاه همکار' },
  { key: 'successRate',         label: 'درصد موفقیت', hint: 'بین ۰ تا ۱۰۰' },
  { key: 'yearsExperience',     label: 'سال تجربه' },
  { key: 'averageRating',       label: 'میانگین امتیاز (۰ تا ۵)', step: 0.1 },
  { key: 'reviewsCount',        label: 'تعداد نظرات' },
];

const toView = (s: SiteStatsView): PayloadShape => ({
  studentsCount: s.students, partnerUniversities: s.universities,
  successRate: s.success, yearsExperience: s.experience,
  averageRating: s.rating, reviewsCount: s.reviews,
});

export default function StatsForm({ initial }: { initial: SiteStatsView }) {
  const [form, setForm] = useState<PayloadShape>(toView(initial));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const change = (key: keyof PayloadShape) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    setForm({ ...form, [key]: raw === '' ? null : Number(raw) });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/stats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const next: SiteStatsView = await res.json();
      setForm(toView(next));
      setStatus('ذخیره شد ✓');
    } catch (e) {
      setStatus(e instanceof Error ? `خطا: ${e.message}` : 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5 bg-white rounded-2xl shadow p-6">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {f.label}
            {f.hint && <span className="text-xs text-gray-400 mr-2">({f.hint})</span>}
          </label>
          <input
            type="number"
            step={f.step ?? 1}
            value={form[f.key] ?? ''}
            onChange={change(f.key)}
            placeholder="خالی = پنهان"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      ))}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium"
        >
          {saving ? 'در حال ذخیره…' : 'ذخیره'}
        </button>
        {status && <span className="text-sm text-gray-600">{status}</span>}
      </div>
    </form>
  );
}
