'use client';

import { useEffect, useState } from 'react';

type Review = {
  id: string;
  authorName: string;
  authorEmail?: string | null;
  rating: number;
  title?: string | null;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState<string>('PENDING');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/reviews?status=${status}`);
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [status]);

  const updateStatus = async (id: string, newStatus: Review['status']) => {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('مطمئنی می‌خواهی این نظر حذف شود؟')) return;
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">مدیریت نظرات</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="PENDING">منتظر تایید</option>
          <option value="APPROVED">تایید شده</option>
          <option value="REJECTED">رد شده</option>
        </select>
      </div>

      {loading ? <p>...</p> : (
        <div className="space-y-4">
          {reviews.length === 0 && <p className="text-gray-500">نظری وجود ندارد.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{r.authorName}
                    {r.authorEmail && <span className="text-xs text-gray-500 mr-2">({r.authorEmail})</span>}
                  </h3>
                  <div className="text-yellow-500 text-lg">
                    {'★'.repeat(r.rating)}<span className="text-gray-300">{'★'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.title && <h4 className="font-semibold mt-2">{r.title}</h4>}
                  <p className="text-gray-700 mt-2 whitespace-pre-wrap">{r.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {r.status !== 'APPROVED' && (
                    <button
                      onClick={() => updateStatus(r.id, 'APPROVED')}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded"
                    >تایید</button>
                  )}
                  {r.status !== 'REJECTED' && (
                    <button
                      onClick={() => updateStatus(r.id, 'REJECTED')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1.5 rounded"
                    >رد</button>
                  )}
                  <button
                    onClick={() => remove(r.id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded"
                  >حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
