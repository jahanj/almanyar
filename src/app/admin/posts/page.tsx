'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Post = {
  id: string;
  slug: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  coverImageUrl: string | null;
  category: { slug: string; name: string };
  tags: { tag: { slug: string; name: string } }[];
};

const STATUS_LABEL: Record<Post['status'], { label: string; cls: string }> = {
  DRAFT:     { label: 'پیش‌نویس',  cls: 'bg-gray-100 text-gray-700' },
  PUBLISHED: { label: 'منتشرشده',  cls: 'bg-emerald-100 text-emerald-800' },
  ARCHIVED:  { label: 'بایگانی',   cls: 'bg-amber-100 text-amber-800' },
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'' | Post['status']>('');

  const load = async () => {
    setLoading(true);
    const url = statusFilter ? `/api/admin/posts?status=${statusFilter}` : '/api/admin/posts';
    const res = await fetch(url);
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [statusFilter]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">اخبار و مقالات</h1>
          <p className="text-sm text-gray-500 mt-1">پست‌های منتشرشده در /fa/news و دسته‌بندی‌های مرتبط.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | Post['status'])}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">همه</option>
            <option value="DRAFT">پیش‌نویس</option>
            <option value="PUBLISHED">منتشرشده</option>
            <option value="ARCHIVED">بایگانی</option>
          </select>
          <Link
            href="/admin/posts/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
          >
            + پست جدید
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">در حال بارگذاری...</p>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
          هنوز پستی ندارید. روی «+ پست جدید» بزنید تا شروع کنید.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-right">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">عنوان</th>
                <th className="px-4 py-3 font-medium text-gray-600">دسته</th>
                <th className="px-4 py-3 font-medium text-gray-600">وضعیت</th>
                <th className="px-4 py-3 font-medium text-gray-600">تاریخ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => {
                const st = STATUS_LABEL[p.status];
                const when = p.publishedAt ?? p.updatedAt;
                return (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.title}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">/{p.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.category.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500" dir="ltr">
                      {new Date(when).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-4 py-3 text-left">
                      <Link href={`/admin/posts/${p.id}/edit`} className="text-blue-600 hover:underline">ویرایش</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
